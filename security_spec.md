# Security Spec: IEADTAM Sunday School DB

## Data Invariants
1. Users must only access data that belongs to their assigned `congregacao`.
2. A generic `usuario` can only create/update/delete records within their own congregation.
3. An `admin` can read/write data across ALL congregations.
4. Users cannot modify their own `role` or `congregacao` once set. Only an `admin` can modify them after creation.

## The "Dirty Dozen" Payloads
1. Create User with injected Admin role: `{"role": "admin", "congregacao": "Sede", "email": "hacker@hacker.com"}` (by a regular user setting up profile) -> Should reject if not admin, but allow first setup if checking email or via specific bootstrap. Wait, " Bootstrapped Admin: Include User email from runtime as an admin". Let's allow users to create their own profile but NOT set their role to 'admin' unless their email matches. 
2. Update User Profile to change Role: `{"role": "admin"}`
3. Create Aluno for another congregação: `{"congregacao": "Outra", "nome": "Test"}`
4. Read Alunos scraping all congregações.
5. Create Chamada with missing `congregacao`.
6. Update Turma changing `congregacao` to something else after creation.
7. Inject 1.5MB junk-character string into `nome`.
8. Inject invalid types `{"qtdBiblia": "2"}` (string instead of number).
9. Missing strict timestamp `createdAt`.
10. Send unapproved fields `{"isVerified": true}`.
11. Update records not belonging to the user's congregation.
12. Unbounded list for `turma.alunos` (Should enforce `.size() <= 500`).

## The Test Runner
To be implemented in `firestore.rules.test.ts`.
