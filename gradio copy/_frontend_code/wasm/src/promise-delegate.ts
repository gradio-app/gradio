type PromiseImplFn<T> = ConstructorParameters<typeof Promise<T>>[0];

export class PromiseDelegate<T> {
	promiseInternal: Promise<T>;
	resolveInternal!: Parameters<PromiseImplFn<T>>[0];
	rejectInternal!: Parameters<PromiseImplFn<T>>[1];

	constructor() {
		this.promiseInternal = new Promise((resolve, reject) => {
			this.resolveInternal = resolve;
			this.rejectInternal = reject;
		});
	}

	get promise(): Promise<T> {
		return this.promiseInternal;
	}

	public resolve(value: T): void {
		this.resolveInternal(value);
	}

	public reject(reason: unknown): void {
		this.rejectInternal(reason);
	}
}
