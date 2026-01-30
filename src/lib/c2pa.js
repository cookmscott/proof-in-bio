import { 
    PlusCircle, Paintbrush, Settings2, Sparkles, Code, 
    MoveDiagonal, SquareStack, Rss, ListMinus, ShieldCheck 
} from 'lucide-svelte';

// Using a stable version for c2pa-web
export const C2PA_VERSION = '0.5.6';

let c2paInstance = null;

export const ACTION_CATEGORIES = {
    'c2pa.created': { order: 1, label: 'Creation & Ingestion', icon: PlusCircle },
    'c2pa.opened': { order: 1, label: 'Creation & Ingestion', icon: PlusCircle },
    'c2pa.placed': { order: 2, label: 'Editorial Content Changes', icon: Paintbrush },
    'c2pa.edited': { order: 2, label: 'Editorial Content Changes', icon: Paintbrush },
    'c2pa.color_adjustments': { order: 3, label: 'Color & Tone Adjustments', icon: Settings2 },
    'c2pa.filtered': { order: 4, label: 'Enhancement (Non-Editorial)', icon: Sparkles },
    // Speed & Timing (5) - c2pa.speed? c2pa.timing?
    // Audio Production (6) - c2pa.audio?
    'c2pa.metadata': { order: 7, label: 'Metadata-Only Changes', icon: Code },
    'c2pa.cropped': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
    'c2pa.resized': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
    'c2pa.orientation': { order: 8, label: 'Resizing & Scaling', icon: MoveDiagonal },
    'c2pa.converted': { order: 9, label: 'File / Format Transformations', icon: SquareStack },
    'c2pa.transcoded': { order: 9, label: 'File / Format Transformations', icon: SquareStack },
    'c2pa.published': { order: 10, label: 'Publishing & Distribution', icon: Rss },
    'c2pa.redacted': { order: 11, label: 'Removal & Redaction', icon: ListMinus },
    'c2pa.removed': { order: 11, label: 'Removal & Redaction', icon: ListMinus },
    'c2pa.watermarked': { order: 12, label: 'Watermarking', icon: ShieldCheck },
    // Font-Specific (13)
};

export function getActionCategory(actionId) {
    return ACTION_CATEGORIES[actionId] || { order: 99, label: 'Other Actions', icon: Code };
}

export function formatActionParameter(action) {
    const params = action.parameters;
    if (!params) return null;
    
    // Handle Adobe ACR specific parameters
    if (params['com.adobe.acr']) {
        const name = params['com.adobe.acr'];
        const value = params['com.adobe.acr.value'];
        return value ? `${name}: ${value}` : name;
    }
    
    // Handle ingredients (e.g. c2pa.opened)
    if (params.ingredients) {
        return `Imported ${params.ingredients.length} asset(s)`;
    }

    // Generic fallback
    const keys = Object.keys(params).filter(k => k !== 'instance_id');
    if (keys.length > 0) return keys.join(', ');
    return null;
}

/**
 * Normalizes the manifest store for UI consumption.
 * Retains original data structures for logging.
 */
export function normalizeManifestStore(store) {
    // C2PA library may return snake_case or camelCase depending on version/context.
    const manifests =
        store?.manifests ??
        store?.manifests_map ??
        store?.manifestsMap ??
        {};

    let active =
        store?.active_manifest ??
        store?.activeManifest ??
        null;

    // Ensure active is just the ID string
    if (active && typeof active === 'object' && active.label) active = active.label;

    const validation_status =
        store?.validation_status ??
        store?.validationStatus ??
        [];

    const validation_results = store?.validation_results ?? store?.validationResults ?? null;
    const validation_state = store?.validation_state ?? store?.validationState ?? null;

    return {
        active_manifest: active,
        manifests,
        validation_status,
        validation_results,
        validation_state
    };
}

/**
 * Extracts Actions based on C2PA Technical Specification.
 * Spec: Assertion label is 'c2pa.actions'.
 * Spec: Data structure is a map containing an 'actions' key (array of Action objects).
 */
export function parseActionsOrder(label = '') {
  // c2pa.actions.v2, c2pa.actions.v2__1, c2pa.actions__2, etc.
  const m = label.match(/__(\d+)$/);
  return m ? Number(m[1]) : 0;
}

export function isActionsLabel(label = '') {
  return /^c2pa\.actions(\.[a-z0-9_]+)?(__\d+)?$/i.test(label);
}

export function applyActionTemplates(data) {
  const actions = Array.isArray(data?.actions) ? data.actions : [];
  const templatesRaw = data?.templates;

  if (!templatesRaw) return actions;

  // Normalize templates into an array
  const templates = Array.isArray(templatesRaw)
    ? templatesRaw
    : (typeof templatesRaw === 'object' ? Object.entries(templatesRaw).map(([action, t]) => ({ action, ...(t || {}) })) : []);

  if (!templates.length) return actions;

  // Merge templates that apply (in order), then overlay action
  return actions.map((a) => {
    const actionName = a?.action;
    if (!actionName) return a;

    const merged = {};

    for (const t of templates) {
      const tAction = t?.action;
      if (!tAction) continue;
      if (tAction !== '*' && tAction !== actionName) continue;

      // templateParameters per spec; tolerate parameters too
      const tParams = t.templateParameters || t.parameters;

      Object.assign(merged, t);
      if (tParams && typeof tParams === 'object') {
        merged.parameters = { ...(merged.parameters || {}), ...tParams };
      }
    }

    // Finally overlay action itself (spec: action overrides template fields)
    const out = { ...merged, ...a };

    // And overlay action.parameters last
    out.parameters = {
      ...(merged.parameters || {}),
      ...(a?.parameters || {})
    };

    // Don’t leak template-only field names into the action object
    delete out.templateParameters;

    return out;
  });
}

export function extractActionsAll(assertions = []) {
  if (!Array.isArray(assertions) || assertions.length === 0) {
    return { actionsLabels: [], actions: [] };
  }

  const actionAssertions = assertions
    .filter(a => isActionsLabel(a?.label || ''))
    .sort((a, b) => parseActionsOrder(a.label) - parseActionsOrder(b.label));

  const all = [];
  const labels = [];

  for (const asrt of actionAssertions) {
    labels.push(asrt.label);
    const data = asrt?.data || null;
    const normalized = applyActionTemplates(data);
    for (const act of normalized) all.push(act);
  }

  // Sort by `when` if present, otherwise preserve original order
  const hasWhen = all.some(a => a?.when);
  if (hasWhen) {
    all.sort((a, b) => {
      const ta = a?.when ? Date.parse(a.when) : NaN;
      const tb = b?.when ? Date.parse(b.when) : NaN;
      if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb;
      if (!Number.isNaN(ta)) return -1;
      if (!Number.isNaN(tb)) return 1;
      return 0;
    });
  }

  return { actionsLabels: labels, actions: all };
}

export function getManifestCaptureStatus(manifest) {
    const { actions } = extractActionsAll(manifest?.assertions || []);
    if (!actions.length) return false;

    const created = actions.find(a => a?.action === 'c2pa.created');
    if (!created) return false;

    // Requirement B: Read digitalSourceType from correct places
    const iptcUri = 'http://cv.iptc.org/newscodes/digitalsourcetype/';
    const rawType = 
        created.digitalSourceType ||
        created[iptcUri] ||
        created.parameters?.digitalSourceType ||
        created.parameters?.[iptcUri];

    if (!rawType) return false;

    // Requirement C: Recognize capture source types
    const t = String(rawType);
    // accept full URIs or tokens; match by inclusion
    return t.includes('digitalCapture') || t.includes('computationalCapture');
}

export function parseIngredientLabelFromUrl(url) {
  // Example: self#jumbf=c2pa.assertions/c2pa.ingredient.v3__1
  // or:     self#jumbf=/c2pa/urn:.../c2pa.assertions/c2pa.ingredient.v3
  if (!url || typeof url !== 'string') return null;

  const idx = url.lastIndexOf('c2pa.assertions/');
  if (idx === -1) return null;

  return url.substring(idx + 'c2pa.assertions/'.length);
}

export function buildIngredientLabelIndex(manifest) {
  // Map ingredient assertion label -> ingredient entry (from manifest.ingredients array)
  const map = new Map();
  for (const ing of (manifest?.ingredients || [])) {
    const label = ing?.label;
    if (label) map.set(label, ing);
  }
  return map;
}

export function extractParentManifestIdsFromActions(manifest) {
  const { actions } = extractActionsAll(manifest?.assertions || []);
  if (!actions.length) return [];

  const ingredientIndex = buildIngredientLabelIndex(manifest);
  const out = new Set();

  for (const act of actions) {
    const ings = act?.parameters?.ingredients;
    if (!Array.isArray(ings)) continue;

    for (const ingRef of ings) {
      const label = parseIngredientLabelFromUrl(ingRef?.url);
      if (!label) continue;

      // ingredient entries often use same label (including __1, __2)
      const entry = ingredientIndex.get(label) || ingredientIndex.get(label.replace(/__(\d+)$/, ''));
      const parentId =
        entry?.active_manifest ||
        entry?.activeManifest ||
        entry?.manifest_id ||
        entry?.manifestId ||
        null;

      if (parentId) out.add(parentId);
    }
  }

  return [...out];
}

export function extractParentManifestIds(manifest) {
  // Combine “easy” top-level ingredient list + spec-aligned action ingredient refs
  const out = new Set();

  // 1) direct ingredient list (good fallback)
  for (const ing of (manifest?.ingredients || [])) {
    const parentId =
      ing?.active_manifest ||
      ing?.activeManifest ||
      ing?.manifest_id ||
      ing?.manifestId ||
      null;
    if (parentId) out.add(parentId);
  }

  // 2) hashed-uri references from actions (spec-aligned)
  for (const parentId of extractParentManifestIdsFromActions(manifest)) out.add(parentId);

  return [...out];
}

function pickManifestValidationResult(store, manifestId) {
  const vr = store?.validation_results || store?.validationResults;
  if (!vr || !manifestId) return null;

  // common shapes seen in different toolchains:
  if (vr.manifests?.[manifestId]) return vr.manifests[manifestId];
  if (vr.manifestResults?.[manifestId]) return vr.manifestResults[manifestId];

  // your current shape:
  if (manifestId === store.active_manifest && vr.activeManifest) return vr.activeManifest;

  return null;
}

function computeCryptoValidated(vres) {
  const failures = vres?.failure || [];
  const successes = vres?.success || [];

  const hasCryptoFailure = failures.some(f =>
    (f.code || '').startsWith('claimSignature.') ||
    (f.code || '').startsWith('assertion.dataHash.') ||
    (f.code || '').startsWith('assertion.hashedURI.')
  );

  const ok = successes.some(s => (s.code || '') === 'claimSignature.validated');
  return ok && !hasCryptoFailure;
}

export function analyzeProvenance(store) {
    if (!store || !store.manifests) return { hasManifest: false, hasActions: false };

    const activeId = store.active_manifest;
    const activeManifest = store.manifests?.[activeId];
    if (!activeManifest) return { hasManifest: false, hasActions: false };

    const hasManifest = true;
    const { actions: activeActions } = extractActionsAll(activeManifest.assertions || []);
    const hasActions = activeActions.length > 0;

    const activeIsCapture = getManifestCaptureStatus(activeManifest);
    let hasCaptureProvenance = activeIsCapture;
    let captureManifest = activeIsCapture ? activeManifest : null;
    let captureManifestId = activeIsCapture ? activeId : null;

    if (!hasCaptureProvenance) {
        const queue = extractParentManifestIds(activeManifest);
        const visited = new Set([activeId]);

        while (queue.length) {
          const parentId = queue.shift();
          if (!parentId || visited.has(parentId)) continue;

          const parent = store.manifests?.[parentId];
          if (!parent) continue;

          visited.add(parentId);

          if (getManifestCaptureStatus(parent)) {
            hasCaptureProvenance = true;
            captureManifest = parent;
            captureManifestId = parentId;
            break;
          }

          // keep walking up
          for (const nextId of extractParentManifestIds(parent)) {
            if (nextId && !visited.has(nextId)) queue.push(nextId);
          }
        }
    }

    const getSigner = (m) =>
        m?.signature_info?.common_name ||
        m?.signature_info?.issuer ||
        'Unknown';

    // Validation (active manifest only, unless your lib exposes per-manifest results)
    const activeV = pickManifestValidationResult(store, activeId) || store.validation_results?.activeManifest;
    const activeSignatureValidated = computeCryptoValidated(activeV);

    const captureV = captureManifestId ? pickManifestValidationResult(store, captureManifestId) : null;
    
    // If we can’t locate a capture validation result, treat it as unknown (null), not false.
    const captureSignatureValidated =
      !hasCaptureProvenance ? null :
      (captureManifestId && captureV) ? computeCryptoValidated(captureV) :
      (activeIsCapture ? activeSignatureValidated : null);

    const activeFailures = activeV?.failure || [];
    const signingCredentialTrusted = !activeFailures.some(f => (f.code || '') === 'signingCredential.untrusted');

    return {
        hasManifest,
        hasActions,
        hasCaptureProvenance,
        activeIsCapture,
        activeSigner: getSigner(activeManifest),
        captureSigner: captureManifest ? getSigner(captureManifest) : null,

        // active manifest validation
        activeSignatureValidated,
        signatureValidated: activeSignatureValidated,
        signingCredentialTrusted,
        
        // Per-manifest validation result (null if unavailable)
        captureSignatureValidated,

        // UI: show actions from active (edits) chain
        actions: activeActions
    };
}

export function extractImageMetadata(manifestStore) {
    if (!manifestStore) return {};
    const normalized = normalizeManifestStore(manifestStore);
    const activeManifest = normalized.manifests?.[normalized.active_manifest];
    if (!activeManifest) return {};

    const metadata = {
        c2pa_manifest: manifestStore,
        // c2pa_verified will be set by the caller based on validation logic
    };

    // Helper to find assertion data by label prefix
    const findAssertionData = (labelPrefix) => {
        return activeManifest.assertions?.find(a => a.label && a.label.startsWith(labelPrefix))?.data;
    };

    const exif = findAssertionData('stds.exif') || {};
    // Sometimes exif is directly in the assertion or wrapped
    
    metadata.exif_data = exif;
    
    // Map Exif fields
    // Note: C2PA stds.exif keys are usually "exif:FNumber", "tiff:Make", etc.
    // We try to access them directly.
    
    metadata.camera = exif['tiff:Model'] || exif['tiff:Make'] || null;
    metadata.lens = exif['aux:Lens'] || exif['exif:LensModel'] || null;
    metadata.focal_length = exif['exif:FocalLength'] ? String(exif['exif:FocalLength']) : null;
    metadata.aperture = exif['exif:FNumber'] ? String(exif['exif:FNumber']) : null;
    metadata.shutter_speed = exif['exif:ExposureTime'] ? String(exif['exif:ExposureTime']) : null;
    metadata.iso = exif['exif:IsoSpeedRatings'] ? Number(exif['exif:IsoSpeedRatings']) : null;
    metadata.captured_at = exif['exif:DateTimeOriginal'] || exif['exif:DateTimeDigitized'] || null;
    metadata.flash = exif['exif:Flash'] ? String(exif['exif:Flash']) : null;
    metadata.white_balance = exif['exif:WhiteBalance'] ? String(exif['exif:WhiteBalance']) : null;
    metadata.exposure_mode = exif['exif:ExposureMode'] ? String(exif['exif:ExposureMode']) : null;
    metadata.metering_mode = exif['exif:MeteringMode'] ? String(exif['exif:MeteringMode']) : null;
    
    // GPS
    metadata.gps_lat = exif['exif:GPSLatitude'] ? Number(exif['exif:GPSLatitude']) : null;
    metadata.gps_lng = exif['exif:GPSLongitude'] ? Number(exif['exif:GPSLongitude']) : null;
    metadata.gps_alt = exif['exif:GPSAltitude'] ? Number(exif['exif:GPSAltitude']) : null;
    
    // Note on GPSRef: latitude/longitude might be absolute or require ref (N/S/E/W).
    // Standard Exif usually handles this but if stored as rational array + Ref, logic is more complex.
    // For now assuming simple number or pre-parsed. If it's a string "45/1", it's tricky.
    // Ideally use a robust exif parser, but we are limited here.
    
    return metadata;
}

export async function loadC2pa() {
    if (c2paInstance) return c2paInstance;

    try {
        const url = `https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@${C2PA_VERSION}/+esm`;
        const module = await import(/* @vite-ignore */ url);
        const createC2pa = module.createC2pa;
        
        c2paInstance = await createC2pa({
            wasmSrc: `https://cdn.jsdelivr.net/npm/@contentauth/c2pa-web@${C2PA_VERSION}/dist/resources/c2pa_bg.wasm`
        });
        return c2paInstance;
    } catch (err) {
        console.error("Failed to load C2PA library", err);
        throw new Error("Failed to load C2PA library. Please check your internet connection.");
    }
}