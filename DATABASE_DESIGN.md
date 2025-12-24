# Proof in Bio - Database Schema Design

## Overview
This schema is designed for a C2PA-verified photo platform that emphasizes authenticity and provenance tracking. The design balances social features with technical requirements for cryptographic verification.

## Core Design Principles

### 1. C2PA-First Architecture
- **C2PA Manifest Storage**: Each photo stores its complete C2PA manifest as JSONB
- **Provenance Chain**: `photoHistory` table tracks every edit with C2PA assertions
- **Verification Status**: Photos have explicit verification states (pending, verified, failed)

### 2. Supabase Integration
- **User IDs**: Uses UUID matching Supabase auth.users.id
- **Hybrid Auth**: Extends Supabase users with profile data in our `users` table
- **RLS Ready**: Structure supports Row Level Security policies

### 3. Performance Optimization
- **Strategic Indexing**: Key queries are indexed (user feeds, photo searches, C2PA status)
- **JSONB for Flexibility**: EXIF and C2PA data stored as JSONB for query flexibility
- **Denormalized Counters**: View counts and like counts for performance

## Table Breakdown

### Users (`users`)
Extends Supabase auth with profile information:
- **Username**: Unique, URL-friendly identifiers for `/username` routes
- **Profile Data**: Bio, avatar, website, location for rich profiles
- **Verification**: Platform verification badges separate from C2PA
- **Privacy**: Public/private profile toggle

### Photos (`photos`)
Core photo storage with comprehensive metadata:
- **File Management**: Original filenames, storage URLs, thumbnails
- **C2PA Integration**: Manifest storage, verification status, timestamps
- **EXIF Preservation**: Camera settings, capture time, technical metadata
- **Visibility Controls**: Public/private, archiving, view tracking

### Photo History (`photoHistory`)
Critical for C2PA provenance:
- **Edit Tracking**: Every modification logged with software details
- **C2PA Assertions**: Individual assertions for each edit step
- **Parameters**: Edit settings stored as JSON for transparency
- **Timeline**: Precise timestamps for chronological history

### Tags (`tags`)
Flexible categorization system:
- **Official vs User**: System tags vs community-created tags
- **Usage Tracking**: Popularity metrics for trending tags
- **Color Coding**: Visual organization in UI
- **SEO Friendly**: Slugs for URL-based tag browsing

### Social Features
- **Likes**: Simple engagement tracking with uniqueness constraints
- **Comments**: Threaded discussions with edit tracking
- **Follows**: User relationships for personalized feeds
- **Collections**: User-curated photo albums

### Activity System (`activities`)
Powers feeds and notifications:
- **Flexible Events**: Upload, like, comment, follow actions
- **Rich Metadata**: Context data stored as JSON
- **Timeline Support**: Chronological activity streams

## Key Relationships

### Photo Ownership Chain
```
users → photos → photoHistory → c2paAssertions
```

### Social Engagement
```
users → likes/comments → photos
users → follows → users
```

### Content Organization
```
users → collections → collectionPhotos → photos
photos → photoTags → tags
```

## Indexing Strategy

### High-Volume Queries
- **User Feeds**: `photos.userId` + `createdAt` for chronological feeds
- **Public Gallery**: `photos.isPublic` for discovery
- **Tag Browsing**: `photoTags.tagId` for category pages
- **C2PA Status**: `photos.c2paStatus` for verification filtering

### Unique Constraints
- **Usernames**: Prevent duplicates for clean URLs
- **Photo-Tag Pairs**: Prevent duplicate tag assignments
- **User-Photo Likes**: Prevent double-liking
- **Follow Relationships**: Prevent duplicate follows

## Data Types Rationale

### UUIDs for Primary Keys
- **Supabase Compatibility**: Matches auth.users.id format
- **Security**: Prevents enumeration attacks
- **Distribution**: Better for distributed systems

### JSONB for Semi-Structured Data
- **C2PA Manifests**: Complex nested structure, queryable
- **EXIF Data**: Variable fields across camera manufacturers
- **Activity Metadata**: Flexible event context storage

### Timestamps
- **Created/Updated**: Standard audit trail
- **C2PA Verification**: When verification completed
- **Captured At**: From EXIF, when photo was taken

## Scalability Considerations

### Read Optimization
- **View Counts**: Denormalized for performance
- **Tag Use Counts**: Cached popularity metrics
- **Cover Photos**: Direct reference for collection thumbnails

### Write Performance
- **Batch Operations**: Photo uploads with tags in transactions
- **Async Processing**: C2PA verification can be background task
- **Activity Logging**: Can be queued for high-traffic scenarios

## Future Extensions

### Potential Additions
- **Photo Series**: Grouped photos (before/after, sequences)
- **Licensing**: Usage rights and commercial permissions
- **Watermarking**: Dynamic watermark generation
- **Analytics**: Detailed view/engagement metrics
- **Notifications**: User notification preferences and delivery

### C2PA Evolution
- **Extended Assertions**: New C2PA standards as they emerge
- **Batch Verification**: Multiple photos in single manifest
- **Cross-Platform**: Integration with other C2PA platforms

## Migration Strategy
1. Start with core tables (users, photos, tags)
2. Add social features (likes, comments, follows)
3. Implement activity system
4. Add advanced features (collections, detailed analytics)

This schema provides a solid foundation that can grow with the platform while maintaining the core focus on authentic, verifiable content.