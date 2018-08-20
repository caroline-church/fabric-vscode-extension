/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
'use strict';

import * as vscode from 'vscode';
import { BlockchainNetworkExplorerProvider } from './explorer/BlockchainNetworkExplorer';
import { BlockchainPackageExplorerProvider } from './explorer/BlockchainPackageExplorer';
import { addConnection } from './commands/addConnectionCommand';
import { deleteConnection } from './commands/deleteConnectionCommand';
import { addConnectionIdentity } from './commands/addConnectionIdentityCommand';
import { connect } from './commands/connectCommand';
import { createFabricProject } from './commands/createFabricProjectCommand';

let blockchainNetworkExplorerProvider;
let blockchainPackageExplorerProvider;

export function activate(context: vscode.ExtensionContext): void {
    console.log('CLIENT activate!!!');

    blockchainNetworkExplorerProvider = new BlockchainNetworkExplorerProvider();
    blockchainPackageExplorerProvider = new BlockchainPackageExplorerProvider();

    vscode.window.registerTreeDataProvider('blockchainExplorer', blockchainNetworkExplorerProvider);
    vscode.window.registerTreeDataProvider('blockchainAPackageExplorer', blockchainPackageExplorerProvider);
    vscode.commands.registerCommand('blockchainExplorer.refreshEntry', (element) => blockchainNetworkExplorerProvider.refresh(element));
    vscode.commands.registerCommand('blockchainExplorer.connectEntry', (connectionName, identityName) => connect(connectionName, identityName));
    vscode.commands.registerCommand('blockchainExplorer.disconnectEntry', () => blockchainNetworkExplorerProvider.disconnect());
    vscode.commands.registerCommand('blockchainExplorer.addConnectionEntry', addConnection);
    vscode.commands.registerCommand('blockchainExplorer.deleteConnectionEntry', (connection) => deleteConnection(connection));
    vscode.commands.registerCommand('blockchainExplorer.addConnectionIdentityEntry', (connection) => addConnectionIdentity(connection));
    vscode.commands.registerCommand('blockchainExplorer.testEntry', (data) => blockchainNetworkExplorerProvider.test(data));
    vscode.commands.registerCommand('createFabricProjectEntry', createFabricProject);
    vscode.commands.registerCommand('blockchainAPackageExplorer.refreshEntry', () => blockchainPackageExplorerProvider.refresh());

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {

        if (e.affectsConfiguration('fabric.connections') || e.affectsConfiguration('fabric.runtimes')) {
            return vscode.commands.executeCommand('blockchainExplorer.refreshEntry');
        }
    }));
}

/*
 * Needed for testing
 */
export function getBlockchainNetworkExplorerProvider(): BlockchainNetworkExplorerProvider {
    return blockchainNetworkExplorerProvider;
}
export function getBlockchainPackageExplorerProvider(): BlockchainPackageExplorerProvider {
    return blockchainPackageExplorerProvider;
}
