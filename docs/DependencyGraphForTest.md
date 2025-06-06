
  ```mermaid
  graph TD
    RootTestModule-->ConfigModule
  ConfigModule-->ConfigModule
  RootTestModule-->AuthModule
  AuthModule-->UsersModule
  UsersModule-->ConfigModule
  AuthModule-->PassportModule
  PassportModule-->ConfigModule
  AuthModule-->ConfigModule
  RootTestModule-->UsersModule
  RootTestModule-->PassportModule
  RootTestModule-->MikroOrmModule
  MikroOrmModule-->ConfigModule
  ```
  