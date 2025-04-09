export interface Base64File {
	url: string;
	alt_text: string;
}

export interface WebcamOptions {
	mirror: boolean;
	constraints: MediaStreamConstraints;
}
