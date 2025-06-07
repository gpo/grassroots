```mermaid
graph TD
  AppModule-->ConfigModule
AppModule-->ContactsModule
ContactsModule-->EntityManagerModule
EntityManagerModule-->MikroOrmModule
AppModule-->AuthModule
AuthModule-->UsersModule
AuthModule-->PassportModule
AppModule-->PassportModule
```
