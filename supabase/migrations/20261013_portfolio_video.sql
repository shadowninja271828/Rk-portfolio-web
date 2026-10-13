update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'
    ]::text[]
where id = 'portfolio-media';
