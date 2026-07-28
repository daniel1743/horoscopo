CREATE OR REPLACE FUNCTION public.zodiac_sign_position(sign text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE sign
    WHEN 'aries' THEN 1
    WHEN 'tauro' THEN 2
    WHEN 'geminis' THEN 3
    WHEN 'cancer' THEN 4
    WHEN 'leo' THEN 5
    WHEN 'virgo' THEN 6
    WHEN 'libra' THEN 7
    WHEN 'escorpio' THEN 8
    WHEN 'sagitario' THEN 9
    WHEN 'capricornio' THEN 10
    WHEN 'acuario' THEN 11
    WHEN 'piscis' THEN 12
    ELSE NULL
  END;
$$;