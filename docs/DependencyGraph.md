
  ```mermaid
  graph TD
    AppModule-->ConfigModule
  AppModule-->ContactsModule
  ContactsModule-->MikroOrmModule
  MikroOrmModule-->ConfigModule
  ContactsModule-->ConfigModule
  AppModule-->AuthModule
  AuthModule-->UsersModule
  UsersModule-->ConfigModule
  AuthModule-->PassportModule
  PassportModule-->ConfigModule
  AuthModule-->ConfigModule
  AppModule-->UsersModule
  AppModule-->PassportModule
  ```
  