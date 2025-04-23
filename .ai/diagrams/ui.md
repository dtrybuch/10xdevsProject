
flowchart TD
  %% Frontend (Astro + React)
  subgraph "Frontend"
    A["MainLayout (Global Header)"]
    B["Login Page (LoginForm)"]
    C["Register Page (RegisterForm)"]
    D["Forgot Password Page (ForgotPasswordForm)"]
    E["Dashboard / Generacja Fiszek"]
  end

  %% Backend (API & serwisy)
  subgraph "Backend"
    F["API: /auth/login"]
    G["API: /auth/register"]
    H["API: /auth/logout"]
    I["API: /auth/password-recovery"]
    J["API: /auth/password-reset"]
    K["authService"]
    L["Supabase Auth"]
  end

  %% Login flow
  A -- "Przycisk 'Zaloguj'" --> B
  B ==> "Submit credentials" ==> F
  F ==> "Process login" ==> K
  K ==> "Verify credentials" ==> L
  L ==> "Return token" ==> K
  K ==> "Create session" ==> F
  F ==> "Redirect on success" ==> E

  %% Registration flow
  A -- "Przycisk 'Rejestracja'" --> C
  C ==> "Submit registration" ==> G
  G ==> "Process registration" ==> K
  K ==> "Create account" ==> L
  L ==> "Confirm account" ==> K
  K ==> "Return status" ==> G
  G ==> "Redirect to Login" ==> B

  %% Password recovery flow
  A -- "Przycisk 'Zapomniałem hasła'" --> D
  D ==> "Submit email" ==> I
  I ==> "Initiate recovery" ==> K
  K ==> "Request reset" ==> L
  L ==> "Send reset email" ==> I
  I -.-> "Confirmation message" -.-> D

  %% Middleware chroniący dostęp do chronionych stron
  E -.-> "Access check" -.-> A