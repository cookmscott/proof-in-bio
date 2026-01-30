import * as fs from 'node:fs/promises';
// Added 'npm:' prefix to imports for Deno/Supabase compatibility
import { 
    Asset, 
    JPEG, 
    PNG, 
    BMFF 
} from 'npm:@trustnxt/c2pa-ts/asset';
import { SuperBox } from 'npm:@trustnxt/c2pa-ts/jumbf';
import { 
    ManifestStore, 
} from 'npm:@trustnxt/c2pa-ts/manifest';

/**
 * Mapping of common IPTC Digital Source Types to human-readable labels.
 * See Spec Section 18.14.4.5 and IPTC NewsCodes for Digital Source Type
 */
const SOURCE_TYPE_LABELS: Record<string, string> = {
    // 1. Captures
    "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture": "📷 Digital capture sampled from real life",
    "http://cv.iptc.org/newscodes/digitalsourcetype/computationalCapture": "📱 Multi-frame computational capture sampled from real life",
    "http://cv.iptc.org/newscodes/digitalsourcetype/screenCapture": "🖥️ Screen capture",
    "http://cv.iptc.org/newscodes/digitalsourcetype/virtualRecording": "📹 Virtual event recording",

    // 2. Analog Digitization
    "http://cv.iptc.org/newscodes/digitalsourcetype/negativeFilm": "🎞️ Digitised from a transparent negative",
    "http://cv.iptc.org/newscodes/digitalsourcetype/positiveFilm": "🎞️ Digitised from a transparent positive",
    "http://cv.iptc.org/newscodes/digitalsourcetype/print": "🖨️ Digitised from a non-transparent medium",

    // 3. Human & Digital Creation
    "http://cv.iptc.org/newscodes/digitalsourcetype/humanEdits": "✏️ Human-edited media",
    "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCreation": "🎨 Digital creation",
    
    // 4. Algorithmic & Data
    "http://cv.iptc.org/newscodes/digitalsourcetype/algorithmicallyEnhanced": "✨ Algorithmically-altered media",
    "http://cv.iptc.org/newscodes/digitalsourcetype/algorithmicMedia": "🧮 Pure algorithmic media",
    "http://cv.iptc.org/newscodes/digitalsourcetype/dataDrivenMedia": "📊 Data-driven media",

    // 5. AI & Generative
    "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia": "🤖 Created using Generative AI",
    "http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia": "🤖 Edited using Generative AI",

    // 6. Composites
    "http://cv.iptc.org/newscodes/digitalsourcetype/composite": "🧩 Composite of elements",
    "http://cv.iptc.org/newscodes/digitalsourcetype/compositeCapture": "🧩 Composite of captured elements",
    "http://cv.iptc.org/newscodes/digitalsourcetype/compositeSynthetic": "🧩 Composite including generative AI elements",
};

/**
 * Interface representing a Single Action structure as per C2PA Spec.
 */
interface C2PAAction {
    action: string;             // The action identifier (e.g., c2pa.cropped)
    softwareAgent?: string;     // The tool used (e.g., "Adobe Photoshop 2024")
    digitalSourceType?: string; // The source of the data
    when?: string;             // Timestamp of the action
    parameters?: Record<string, any>; // Specifics (e.g., coordinates, names)
    description?: string;       // Human-readable description
}

async function reportEditHistory(filePath: string) {
    console.log(`\n📂 Analyzing File: ${filePath}`);

    // 1. Read the File
    let buffer: Buffer;
    try {
        buffer = await fs.readFile(filePath);
    } catch (err) {
        console.error("❌ Error reading file:", err);
        return;
    }

    // 2. Identify Format & Parse Asset
    let asset: Asset;
    try {
        if (JPEG.canRead(buffer)) asset = new JPEG(buffer);
        else if (PNG.canRead(buffer)) asset = new PNG(buffer);
        else if (BMFF.canRead(buffer)) asset = new BMFF(buffer);
        else {
            console.error("❌ Unsupported file format for C2PA parsing.");
            return;
        }
    } catch (err) {
        console.error("❌ Failed to parse asset structure:", err);
        return;
    }

    // 3. Extract Manifest Data
    let jumbf: Buffer | undefined;
    try {
        // Wrapped in try/catch in case the library fails to extract safely
        jumbf = asset.getManifestJUMBF();
    } catch (err) {
        console.error("❌ Error extracting JUMBF structure:", err);
        return;
    }

    if (!jumbf) {
        console.log("⚠️  No C2PA Manifest found in this file.");
        return;
    }

    try {
        const superBox = SuperBox.fromBuffer(jumbf);
        const store = ManifestStore.read(superBox);
        
        if (!store) {
            console.error("❌ ManifestStore is undefined after reading.");
            return;
        }

        const activeManifest = store.activeManifest;

        if (!activeManifest) {
            console.log("⚠️  No active manifest found in the store.");
            return;
        }

        console.log(`ℹ️  Active Manifest Label: ${activeManifest.label || "Unknown"}`);

        // 4. Locate the Actions Assertion
        // We look for 'c2pa.actions.v2' (current) or 'c2pa.actions' (legacy)
        const actionsAssertion = activeManifest.assertions.find(
            (a) => a.label === "c2pa.actions.v2" || a.label === "c2pa.actions"
        );

        if (!actionsAssertion) {
            console.log("ℹ️  No Edit History found (File may be original or history was stripped).");
            return;
        }

        // Cast data to expected structure safely
        const data = actionsAssertion.data as { actions: C2PAAction[] } | undefined;
        
        if (!data || !Array.isArray(data.actions)) {
            console.log("⚠️  Actions assertion found, but data is invalid or empty.");
            return;
        }

        const history = data.actions;

        console.log(`\n📜 EDIT HISTORY LOG (${history.length} actions)`);
        console.log("================================================================");

        // 5. Output Grouped by Action Entry
        history.forEach((item, index) => {
            if (!item) {
                console.warn(`[Action #${index + 1}] Skipped undefined action entry.`);
                return;
            }

            // Clean up the action name (remove 'c2pa.' prefix for title)
            // SAFTEY CHECK: Ensure action is a string before calling methods
            const actionId = item.action || "unknown";
            const friendlyName = (typeof actionId === 'string')
                ? actionId.replace('c2pa.', '').toUpperCase()
                : "UNKNOWN ACTION";
            
            // Resolve the source type to a human label if possible
            const rawSource = item.digitalSourceType || "";
            const sourceLabel = SOURCE_TYPE_LABELS[rawSource] || rawSource || "Unspecified";

            console.log(`\n[Action #${index + 1}] ${friendlyName}`);
            console.log(`   🔹 Action ID:       ${actionId}`);
            console.log(`   🛠️  Software Agent:  ${item.softwareAgent || "Unknown Tool"}`);
            console.log(`   📡 Digital Source:  ${sourceLabel}`);
            
            if (item.when) {
                console.log(`   🕒 Timestamp:       ${item.when}`);
            }

            if (item.description) {
                console.log(`   📝 Description:     "${item.description}"`);
            }

            // Print Parameters if they exist
            if (item.parameters && typeof item.parameters === 'object') {
                console.log(`   ⚙️  Parameters:`);
                try {
                    Object.entries(item.parameters).forEach(([key, value]) => {
                        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                        console.log(`      └─ ${key}: ${valStr}`);
                    });
                } catch (paramErr) {
                    console.error("      └─ (Error displaying parameters)");
                }
            } else {
                console.log(`   ⚙️  Parameters:      (None)`);
            }
        });

        console.log("\n================================================================");

    } catch (err) {
        console.error("❌ Exception during manifest processing:", err);
        // Log the full stack trace to help debug library-internal issues
        if (err instanceof Error && err.stack) {
            console.error(err.stack);
        }
    }
}

// CLI Usage
const filePath = process.argv[2];
if (filePath) {
    reportEditHistory(filePath);
} else {
    console.log("Usage: ts-node c2pa_history_reporter.ts <path-to-image>");
}