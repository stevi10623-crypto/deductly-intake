-- Enable deletion for clients (Firm Admins only)
create policy "Admins can delete their clients"
on clients for delete
using (auth.uid() = firm_admin_id);

-- Optional: Enable deletion for intakes if you want manual control, 
-- but ON DELETE CASCADE usually handles this if the parent delete succeeds.
-- Adding it just in case:
create policy "Admins can delete client intakes"
on intakes for delete
using (
  exists (
    select 1 from clients 
    where clients.id = intakes.client_id 
    and clients.firm_admin_id = auth.uid()
  )
);
