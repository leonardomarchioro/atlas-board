import type { TagView } from "../selects/tag.select";
export class TagPresenter {
  static toHTTP(tag: TagView) {
    return tag;
  }
}
