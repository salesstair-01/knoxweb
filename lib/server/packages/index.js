import { CachedPackagesSource } from "./cached_packages_source";
import { MockPackagesSource } from "./mock_packages_source";


let shared_source = null;


export function get_packages_source() {

  if (shared_source === null) {

    shared_source = new CachedPackagesSource({
      upstream: new MockPackagesSource(),
      ttl_ms: 60 * 1000,
    });

  }

  return shared_source;

}
