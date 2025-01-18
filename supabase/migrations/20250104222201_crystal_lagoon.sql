-- Create UUID generation function
CREATE OR REPLACE FUNCTION generate_uuid()
RETURNS TABLE (id uuid)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY SELECT gen_random_uuid();
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION generate_uuid TO public;