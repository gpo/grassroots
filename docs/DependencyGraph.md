```mermaid
graph TD
  AppModule-->ContactsModule
ContactsModule-->MikroOrmModule
AppModule-->AuthModule
AuthModule-->UsersModule
UsersModule-->MikroOrmModule
AuthModule-->PassportModule
AuthModule-->ConfigModule
AppModule-->PassportModule
AppModule-->OrganizationsModule
```
