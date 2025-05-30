/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Sinon from "sinon";
import { AzureSubscription, AzureTenant } from "@microsoft/vscode-azext-azureauth";

import * as AzureHelpers from "../../src/connectionconfig/azureHelpers";
import { AzureSqlServerInfo } from "../../src/sharedInterfaces/connectionDialog";
import { MssqlVSCodeAzureSubscriptionProvider } from "../../src/azure/MssqlVSCodeAzureSubscriptionProvider";

export const mockSubscriptions = [
    {
        name: "Ten0Sub1",
        subscriptionId: "00000000-0000-0000-0000-111111111111",
        tenantId: "00000000-0000-0000-0000-000000000000",
    },
    {
        name: "Ten1Sub1",
        subscriptionId: "11111111-0000-0000-0000-111111111111",
        tenantId: "11111111-1111-1111-1111-111111111111",
    },
] as AzureSubscription[];

export const mockTenants = [
    {
        displayName: "Tenant Zero",
        id: "00000000-0000-0000-0000-000000000000",
    },
    {
        displayName: "Tenant One",
        id: "11111111-1111-1111-1111-111111111111",
    },
] as unknown as AzureTenant[];

export function stubIsSignedIn(sandbox: Sinon.SinonSandbox, result: boolean) {
    return sandbox.stub(AzureHelpers, "isSignedIn").resolves(result);
}

export function stubConfirmVscodeAzureSignin(sandbox: sinon.SinonSandbox) {
    return sandbox.stub(AzureHelpers, "confirmVscodeAzureSignin").resolves({
        getSubscriptions: () => Promise.resolve(mockSubscriptions),
        getTenants: () => Promise.resolve(mockTenants),
    } as unknown as MssqlVSCodeAzureSubscriptionProvider);
}

export function stubFetchServersFromAzure(sandbox: sinon.SinonSandbox) {
    return sandbox
        .stub(AzureHelpers, "fetchServersFromAzure")
        .callsFake(async (sub: AzureSubscription) => {
            return [
                {
                    location: "TestRegion",
                    resourceGroup: `testResourceGroup-${sub.name}`,
                    server: `testServer-${sub.name}-1`,
                    databases: ["testDatabase1", "testDatabase2"],
                    subscription: `${sub.name} (${sub.subscriptionId})`,
                },
                {
                    location: "TestRegion",
                    resourceGroup: `testResourceGroup-${sub.name}`,
                    server: `testServer-${sub.name}-2`,
                    databases: ["testDatabase1", "testDatabase2"],
                    subscription: `${sub.name} (${sub.subscriptionId})`,
                },
            ] as AzureSqlServerInfo[];
        });
}

export function stubPromptForAzureSubscriptionFilter(sandbox: Sinon.SinonSandbox, result: boolean) {
    return sandbox.stub(AzureHelpers, "promptForAzureSubscriptionFilter").resolves(result);
}
