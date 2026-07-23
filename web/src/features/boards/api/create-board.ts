import type {
  CreateBoardInput,
  CreateBoardResponse,
} from "@/features/boards/types/create-board.types";
import { api } from "@/lib/axios";

export async function createBoard(input: CreateBoardInput): Promise<CreateBoardResponse> {
  const response = await api.post<CreateBoardResponse>("/boards", input);
  return response.data;
}
