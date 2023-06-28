import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("Should be able to create a new User", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });
    expect(user).toHaveProperty("id");
  });

  it("Should not be possible to create a user with email exists", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User",
        email: "user@gg.com",
        password: "123",
      });

      await createUserUseCase.execute({
        name: "New User",
        email: user.email,
        password: "123",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
