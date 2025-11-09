```mermaid
graph TD
  AppModule-->ContactsModule
ContactsModule-->MikroOrmModule
AppModule-->AuthModule
AuthModule-->UsersModule
UsersModule-->MikroOrmModule
AuthModule-->OrganizationsModule
AuthModule-->PassportModule
AppModule-->PassportModule
AppModule-->OrganizationsModule
AppModule-->PhoneCanvassModule
PhoneCanvassModule-->ServerMetaModule
```
