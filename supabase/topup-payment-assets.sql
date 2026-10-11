INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'topup-payment-assets',
    'topup-payment-assets',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read topup payment assets" ON storage.objects;
CREATE POLICY "Public read topup payment assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'topup-payment-assets');

DROP POLICY IF EXISTS "Admins upload topup payment assets" ON storage.objects;
CREATE POLICY "Admins upload topup payment assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'topup-payment-assets'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND lower(role) IN ('admin', 'owner')
    )
);

DROP POLICY IF EXISTS "Admins update topup payment assets" ON storage.objects;
CREATE POLICY "Admins update topup payment assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'topup-payment-assets'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND lower(role) IN ('admin', 'owner')
    )
)
WITH CHECK (
    bucket_id = 'topup-payment-assets'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND lower(role) IN ('admin', 'owner')
    )
);

DROP POLICY IF EXISTS "Admins delete topup payment assets" ON storage.objects;
CREATE POLICY "Admins delete topup payment assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'topup-payment-assets'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND lower(role) IN ('admin', 'owner')
    )
);
