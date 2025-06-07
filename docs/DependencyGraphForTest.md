
  ```mermaid
  graph TD
    RootTestModule-->ConfigModule
  RootTestModule-->AuthModule
  AuthModule-->UsersModule
  AuthModule-->PassportModule
  RootTestModule-->UsersModule
  RootTestModule-->PassportModule
  RootTestModule-->EntityManagerModule
  EntityManagerModule-->MikroOrmModule
  ```
  