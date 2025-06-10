
-- Update the Women Who Go Utah group status to pending
UPDATE public.groups 
SET status = 'pending' 
WHERE name ILIKE '%Women Who Go Utah%';

-- Update all events belonging to Women Who Go Utah group to pending status
UPDATE public.events 
SET status = 'pending' 
WHERE group_id IN (
  SELECT id 
  FROM public.groups 
  WHERE name ILIKE '%Women Who Go Utah%'
);
