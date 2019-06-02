import { htm } from "@zeit/integration-utils";

export function error(errorString: string): string {
    return htm`
    <Notice type="error">${errorString}</Notice>
    `
}