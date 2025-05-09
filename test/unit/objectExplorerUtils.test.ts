/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";
import { ObjectExplorerUtils } from "../../src/objectExplorer/objectExplorerUtils";
import { expect, assert } from "chai";
import * as Constants from "../../src/constants/constants";
import { TreeNodeInfo } from "../../src/objectExplorer/nodes/treeNodeInfo";
import { ConnectionProfile } from "../../src/models/connectionProfile";
import { ObjectMetadata } from "vscode-mssql";

suite("Object Explorer Utils Tests", () => {
    test("Test iconPath function", () => {
        const testObjects = ["Server", "Table", "StoredProcedure"];
        const expectedPaths = ["Server.svg", "Table.svg", "StoredProcedure.svg"];
        for (let i = 0; i < testObjects.length; i++) {
            const iconPath = ObjectExplorerUtils.iconPath(testObjects[i]);
            const fileName = path.basename(iconPath.fsPath);
            expect(fileName, "File name should be the same as expected file name").is.equal(
                expectedPaths[i],
            );
        }
    });

    test("Test getNodeUri function", () => {
        const disconnectedProfile = new ConnectionProfile();
        disconnectedProfile.server = "disconnected_server";
        const testProfile = new ConnectionProfile();
        testProfile.server = "test_server";
        testProfile.profileName = "test_profile";
        testProfile.database = "test_database";
        testProfile.user = "test_user";
        testProfile.authenticationType = Constants.sqlAuthentication;
        const disconnectedTestNode = new TreeNodeInfo(
            "disconnectedTest",
            undefined,
            undefined,
            undefined,
            undefined,
            "disconnectedServer",
            undefined,
            disconnectedProfile,
            undefined,
            undefined,
            undefined,
        );
        const serverTestNode = new TreeNodeInfo(
            "serverTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Server",
            undefined,
            testProfile,
            undefined,
            undefined,
            undefined,
        );
        const databaseTestNode = new TreeNodeInfo(
            "databaseTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Database",
            undefined,
            testProfile,
            serverTestNode,
            undefined,
            undefined,
        );
        const tableTestNode = new TreeNodeInfo(
            "tableTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Table",
            undefined,
            testProfile,
            databaseTestNode,
            undefined,
            undefined,
        );
        const testNodes = [disconnectedTestNode, serverTestNode, tableTestNode];
        const expectedUris = [
            "disconnected_server_undefined_undefined",
            "test_server_test_database_test_user_test_profile",
            "test_server_test_database_test_user_test_profile",
        ];

        for (let i = 0; i < testNodes.length; i++) {
            const nodeUri = ObjectExplorerUtils.getNodeUri(testNodes[i]);
            expect(nodeUri, "Node URI should be the same as expected Node URI").is.equal(
                expectedUris[i],
            );
        }
    });

    test("Test getNodeUriFromProfile", () => {
        const testProfile = new ConnectionProfile();
        testProfile.server = "test_server";
        testProfile.profileName = "test_profile";
        testProfile.database = "test_database";
        testProfile.user = "test_user";
        testProfile.authenticationType = Constants.sqlAuthentication;
        const testProfile2 = new ConnectionProfile();
        testProfile2.server = "test_server2";
        testProfile2.profileName = undefined;
        testProfile2.authenticationType = "Integrated";
        const testProfiles = [testProfile, testProfile2];
        const expectedProfiles = [
            "test_server_test_database_test_user_test_profile",
            "test_server2_undefined_undefined",
        ];

        for (let i = 0; i < testProfiles.length; i++) {
            const uri = ObjectExplorerUtils.getNodeUriFromProfile(testProfiles[i]);
            expect(uri, "Node URI should be the same as expected Node URI").is.equal(
                expectedProfiles[i],
            );
        }
    });

    test("Test getDatabaseName", () => {
        const testProfile = new ConnectionProfile();
        testProfile.server = "test_server";
        testProfile.profileName = "test_profile";
        testProfile.database = "test_database";
        testProfile.user = "test_user";
        const serverTestNode = new TreeNodeInfo(
            "serverTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Server",
            undefined,
            testProfile,
            undefined,
            undefined,
            undefined,
        );
        let databaseMetatadata: ObjectMetadata = {
            metadataType: undefined,
            metadataTypeName: Constants.databaseString,
            urn: undefined,
            name: "databaseTest",
            schema: undefined,
        };
        const databaseTestNode = new TreeNodeInfo(
            "databaseTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Database",
            undefined,
            undefined,
            serverTestNode,
            undefined,
            undefined,
            databaseMetatadata,
        );
        const databaseTestNode2 = new TreeNodeInfo(
            "databaseTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Database",
            undefined,
            undefined,
            serverTestNode,
            undefined,
            undefined,
        );
        const tableTestNode = new TreeNodeInfo(
            "tableTest",
            undefined,
            undefined,
            "test_path",
            undefined,
            "Table",
            undefined,
            undefined,
            databaseTestNode,
            undefined,
            undefined,
        );
        const testNodes = [serverTestNode, databaseTestNode, databaseTestNode2, tableTestNode];
        const expectedDatabaseNames = [
            "test_database",
            "databaseTest",
            "<default>",
            "databaseTest",
        ];
        for (let i = 0; i < testNodes.length; i++) {
            let databaseName = ObjectExplorerUtils.getDatabaseName(testNodes[i]);
            assert.equal(databaseName, expectedDatabaseNames[i]);
        }
    });

    test("Test isFirewallError", () => {
        const loginError = 18456;
        assert.isNotTrue(
            ObjectExplorerUtils.isFirewallError(loginError),
            "Error should not be a firewall error",
        );
        const firewallError = Constants.errorFirewallRule;
        assert.isTrue(
            ObjectExplorerUtils.isFirewallError(firewallError),
            "Error should be a firewall error",
        );
    });
});
