/**
 * Decides whether a published page is live right now, honouring
 * publish_at and expire_at.
 *
 * Result state: "live" | "not_yet" | "expired"
 */
export class PageVisibility {

  #now;


  constructor(now) {

    this.#now = now || new Date();

  }


  state_of(page) {

    let _state = "live";

    if (!!page.publish_at && new Date(page.publish_at) > this.#now) {

      _state = "not_yet";

    } else if (!!page.expire_at && new Date(page.expire_at) <= this.#now) {

      _state = "expired";

    }

    return _state;

  }

}
