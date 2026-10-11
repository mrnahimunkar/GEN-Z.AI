CREATE TABLE IF NOT EXISTS public.topup_payment_methods (
    method text PRIMARY KEY
        CHECK (method IN ('bca', 'dana', 'seabank', 'qris')),
    display_name text NOT NULL,
    account_number text NOT NULL DEFAULT '',
    account_name text NOT NULL DEFAULT '',
    qr_image_url text NOT NULL DEFAULT '',
    is_active boolean NOT NULL DEFAULT false,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.topup_payment_methods ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.topup_payment_methods
    TO authenticated;

DROP POLICY IF EXISTS "Authenticated users read active topup methods"
    ON public.topup_payment_methods;
CREATE POLICY "Authenticated users read active topup methods"
    ON public.topup_payment_methods
    FOR SELECT
    TO authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage topup methods"
    ON public.topup_payment_methods;
CREATE POLICY "Admins manage topup methods"
    ON public.topup_payment_methods
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
              AND lower(role) IN ('admin', 'owner')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
              AND lower(role) IN ('admin', 'owner')
        )
    );

INSERT INTO public.topup_payment_methods (method, display_name)
VALUES
    ('bca', 'BCA'),
    ('dana', 'DANA'),
    ('seabank', 'SeaBank'),
    ('qris', 'QRIS')
ON CONFLICT (method) DO NOTHING;
