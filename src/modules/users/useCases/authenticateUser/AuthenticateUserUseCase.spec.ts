import { clear } from "console";
import auth from "../../../../config/auth";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User ", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able to Authenticate an User", async () => {
    const user: ICreateUserDTO = {
      name: "User",
      email: "user@gg.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    auth.jwt.secret = user.password;

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate an nonexistent User", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@gg.com",
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be to authenticate with incorrect password", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "User",
        email: "user@gg.com",
        password: "123",
      });
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "321",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
