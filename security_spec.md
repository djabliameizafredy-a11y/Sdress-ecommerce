# Security Specification for Sdress Boutique

## Data Invariants
1. **Products**: Publicly readable, but only writeable by the Admin (`VendeurAdmin1945@gmail.com`).
2. **Config**: Publicly readable, but only writeable by the Admin.
3. **Admin Identity**: Strictly tied to the email `VendeurAdmin1945@gmail.com`.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Unauthorized Product Create**: An unauthenticated user tries to add a product.
2. **Public User Product Edit**: A logged-in non-admin user tries to change a product price.
3. **Admin Identity Spoofing**: A user tries to update their own auth token (not possible via rules, but we check if we mistakenly rely on client data).
4. **Invalid Product Schema**: Admin tries to create a product missing `newPrice`.
5. **Resource Poisoning**: Admin tries to use a 1MB string as a product name.
6. **Config Overwrite**: Public user tries to change the WhatsApp link in `config/admin`.
7. **Negative Price**: Admin tries to set a product price to -100.
8. **Invalid Category**: Admin tries to set category to "spaceship".
9. **Orphaned Write**: Trying to write to a collection not in the blueprint.
10. **ID Injection**: Trying to use special characters in a document ID.
11. **Future Timestamp**: Setting `createdAt` to a point in the future (optional, but good for integrity).
12. **Public User Write to Config**: Public user tries to create their own config document.

## Test Runner (Logic Overview)
The rules must ensure:
- `isAdmin()` check is solid (email + verification).
- `isValidProduct()` checks types, sizes, and required fields.
- `isValidConfig()` checks WhatsApp link format.
