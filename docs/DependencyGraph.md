```mermaid
graph TD
  AppModule-->ConfigModule
AppModule-->ContactsModule
ContactsModule-->MikroOrmModule
AppModule-->AuthModule
AuthModule-->UsersModule
UsersModule-->MikroOrmModule
AuthModule-->OrganizationsModule
AuthModule-->PassportModule
AuthModule-->ConfigModule
AppModule-->PassportModule
AppModule-->OrganizationsModule
AppModule-->PhoneCanvassModule
PhoneCanvassModule-->ConfigModule
```
