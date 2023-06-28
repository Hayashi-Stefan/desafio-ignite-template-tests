import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("Should be able show profile an User", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User",
      email: "user@gg.com",
      password: "123",
    });

    const user_id = await showUserProfileUseCase.execute(user.id as string);

    expect(user_id).toHaveProperty("id");
  });

  it("Should not be able show profile an nonexistent User", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
