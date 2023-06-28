import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementRepositoryInMemory
    );
  });

  it("Should be able to create a new deposit", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 40,
      description: "Description Test",
    });

    expect(deposit).toHaveProperty("id");
  });

  it("Should not be able to create a new deposit for nonexistent User", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "123",
        type: OperationType.DEPOSIT,
        amount: 12,
        description: "Description Deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able a new withdraw", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 20,
      description: "Deposit",
    });

    const result = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 15,
      description: "Deposit",
    });
    expect(result).toHaveProperty("id");
  });

  it("Should not be able create a new deposit if the balance to insufficient", () => {
    expect(async () => {
      const user = await usersRepositoryInMemory.create({
        name: "User",
        email: "user@gg.com",
        password: "123",
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.DEPOSIT,
        amount: 20,
        description: "Deposit",
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 25,
        description: "WITHDRAW",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
