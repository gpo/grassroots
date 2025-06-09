
  ```mermaid
  graph TD
    RootTestModule-->ConfigModule
  RootTestModule-->PassportModule
  RootTestModule-->ContactsModule
  ContactsModule-->EntityManagerModule
  EntityManagerModule-->MikroOrmModule
  ```
  