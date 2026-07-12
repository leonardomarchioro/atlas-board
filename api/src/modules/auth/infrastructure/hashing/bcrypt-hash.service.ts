import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcrypt";

import { HashService } from "./hash.service";

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptHashService implements HashService {
  hash(value: string): Promise<string> {
    return hash(value, SALT_ROUNDS);
  }

  compare(value: string, hashedValue: string): Promise<boolean> {
    return compare(value, hashedValue);
  }
}
