import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Statement Operation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to list one statement by Id", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    const { id } = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "First Statement",
      type: OperationType.DEPOSIT,
    });

    const statementId = id ? id : "1";

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statementId,
    });

    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation.amount).toEqual(100);
  });

  it("Should not be able to list a statement with a non existing user id", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    const { id } = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 100,
      description: "First Statement",
      type: OperationType.DEPOSIT,
    });

    const statementId = id ? id : "1";

    //non existing user Id
    const fakeUserId = "1";

    await expect(
      getStatementOperationUseCase.execute({
        user_id: fakeUserId,
        statement_id: statementId,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to list a statement with incorrect statement id", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: "First Deposit",
      amount: 100,
    });

    const fakeStatementId = "1";

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: fakeStatementId,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
