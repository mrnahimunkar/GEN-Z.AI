INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'topup-proofs',
    'topup-proofs',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "topup proofs users upload own" ON storage.objects;
CREATE POLICY "topup proofs users upload own"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'topup-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "topup proofs users and admins view" ON storage.objects;
CREATE POLICY "topup proofs users and admins view"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'topup-proofs'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
              AND lower(role) IN ('admin', 'owner')
        )
    )
);

DROP POLICY IF EXISTS "topup proofs users delete own" ON storage.objects;
CREATE POLICY "topup proofs users delete own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'topup-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
