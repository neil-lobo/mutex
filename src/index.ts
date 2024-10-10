class Mutex {
	#_buff: SharedArrayBuffer;
	#buff: Uint8Array;

	constructor() {
		this.#_buff = new SharedArrayBuffer(1);
		this.#buff = new Uint8Array(this.#_buff);
	}

	/**
	 * Acquire lock, wait if locked. If a timeout is specified, wait for said time. If the timeout is reached, return `false` indicating a failure to lock.
	 *
	 * Note:
	 * this implementation uses busy waiting
	 *
	 * @param timeout timeout in milliseconds
	 * @return `true` if successfully acquired lock, `false` otherwise
	 */
	lock(timeout?: number): boolean {
		const lockStart = new Date().getTime();
		while (Atomics.compareExchange(this.#buff, 0, 0, 1) === 1) {
			if (!timeout) continue;

			const now = new Date().getTime();
			if (now - lockStart >= timeout) {
				this.unlock();
				return false;
			}
		}
		return true;
	}

	/**
	 * Unlock mutex
	 */
	unlock() {
		Atomics.store(this.#buff, 0, 0);
	}

	/**
	 * Check if mutex is locked
	 */
	isLocked(): boolean {
		return Boolean(Atomics.load(this.#buff, 0));
	}
}
