import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get balance", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("Should be able to get the balance", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      amount: 200,
      description: "First Deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });
    await createStatementUseCase.execute({
      amount: 200,
      description: "Second Deposit",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });
    await createStatementUseCase.execute({
      amount: 100,
      description: "First WithDraw",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance.balance).toEqual(300);
    expect(balance.statement).toHaveLength(3);
  });

  it("Should not be able to get balance with user which does not exists", () => {
    expect(async () => {
      const userId = "123";

      await getBalanceUseCase.execute({ user_id: userId });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
