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
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as path from 'path';

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ExtensionUtil } from '../src/util/ExtensionUtil';

chai.should();
chai.use(sinonChai);

// tslint:disable no-unused-expression
describe('Extension Tests', () => {

    let mySandBox;

    beforeEach(async () => {
        mySandBox = sinon.createSandbox();

        await ExtensionUtil.activateExtension();
    });

    afterEach(() => {
        mySandBox.restore();
    });

    it('should check all the commands are registered', async () => {
        const allCommands = await vscode.commands.getCommands();

        const blockchainCommands = allCommands.filter((command) => {
            return command.startsWith('blockchain');
        });

        blockchainCommands.should.deep.equal([
            'blockchainExplorer.refreshEntry',
            'blockchainExplorer.connectEntry',
            'blockchainExplorer.disconnectEntry',
            'blockchainExplorer.addConnectionEntry',
            'blockchainExplorer.deleteConnectionEntry',
            'blockchainExplorer.addConnectionIdentityEntry',
            'blockchain.createSmartContractProjectEntry',
            'blockchainAPackageExplorer.refreshEntry'
        ]);
    });

    it('should check the activation events are correct', async () => {
        const packageJSON: any = ExtensionUtil.getPackageJSON();
        const activationEvents: string[] = packageJSON.activationEvents;

        activationEvents.should.deep.equal([
            'onView:blockchainExplorer',
            'onCommand:blockchainExplorer.addConnectionEntry',
            'onCommand:blockchainExplorer.deleteConnectionEntry',
            'onCommand:blockchainExplorer.addConnectionIdentityEntry',
            'onCommand:blockchainExplorer.connectEntry',
            'onCommand:blockchainExplorer.disconnectEntry',
            'onCommand:blockchain.createSmartContractProjectEntry'
        ]);
    });

    it('should refresh the tree when a connection is added', async () => {
        await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

        const treeDataProvider = myExtension.getBlockchainNetworkExplorerProvider();

        const treeSpy = mySandBox.spy(treeDataProvider['_onDidChangeTreeData'], 'fire');

        const rootPath = path.dirname(__dirname);

        const myConnection = {
            name: 'myConnection',
            connectionProfilePath: path.join(rootPath, '../test/data/connectionTwo/connection.json'),
            identities: [{
                certificatePath: path.join(rootPath, '../test/data/connectionTwo/credentials/certificate'),
                privateKeyPath: path.join(rootPath, '../test/data/connectionTwo/credentials/privateKey')
            }]
        };

        await vscode.workspace.getConfiguration().update('fabric.connections', [myConnection], vscode.ConfigurationTarget.Global);

        treeSpy.should.have.been.called;
    });

    it('should refresh the tree when a runtime is added', async () => {
        await vscode.workspace.getConfiguration().update('fabric.runtimes', [], vscode.ConfigurationTarget.Global);

        const treeDataProvider = myExtension.getBlockchainNetworkExplorerProvider();

        const treeSpy = mySandBox.spy(treeDataProvider['_onDidChangeTreeData'], 'fire');

        const myRuntime = {
            name: 'myRuntime',
            developmentMode: false
        };

        await vscode.workspace.getConfiguration().update('fabric.runtimes', [myRuntime], vscode.ConfigurationTarget.Global);

        treeSpy.should.have.been.called;
    });
});
