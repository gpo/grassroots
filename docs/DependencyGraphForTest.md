
  ```mermaid
  graph TD
    RootTestModule-->ConfigModule
  RootTestModule-->PassportModule
  RootTestModule-->EntityManagerModule
  EntityManagerModule-->MikroOrmModule
  RootTestModule-->ContactsModule
  ContactsModule-->EntityManagerModule
  ```
  