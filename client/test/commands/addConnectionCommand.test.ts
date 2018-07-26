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

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.should();
chai.use(sinonChai);

describe('AddConnectionCommand', () => {
    let mySandBox;

    describe('addConnection', () => {

        beforeEach(() => {
            mySandBox = sinon.createSandbox();
        });

        afterEach(() => {
            mySandBox.restore();
        });

        it('should test a connection can be added', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves('myConnection');
            showInputBoxStub.onSecondCall().resolves('connection.json');
            showInputBoxStub.onThirdCall().resolves('/myCertPath');
            showInputBoxStub.onCall(3).resolves('/myPrivateKeyPath');

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            const connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(1);
            connections[0].should.deep.equal({
                name: 'myConnection',
                connectionProfilePath: 'connection.json',
                identities: [{
                    certificatePath: '/myCertPath',
                    privateKeyPath: '/myPrivateKeyPath'
                }]
            });

            executeCommandSpy.should.have.been.calledWith('blockchainExplorer.refreshEntry');
        });

        it('should test another connection can be added', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves('myConnection');
            showInputBoxStub.onSecondCall().resolves('connection.json');
            showInputBoxStub.onThirdCall().resolves('/myCertPath');
            showInputBoxStub.onCall(3).resolves('/myPrivateKeyPath');

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            // execute a command to force the extension activation
            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            let connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(1);
            connections[0].should.deep.equal({
                name: 'myConnection',
                connectionProfilePath: 'connection.json',
                identities: [{
                    certificatePath: '/myCertPath',
                    privateKeyPath: '/myPrivateKeyPath'
                }]
            });

            showInputBoxStub.onCall(4).resolves('myConnection2');
            showInputBoxStub.onCall(5).resolves('connection2.json');
            showInputBoxStub.onCall(6).resolves('/myCertPath2');
            showInputBoxStub.onCall(7).resolves('/myPrivateKeyPath2');

            // execute a command to force the extension activation
            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            executeCommandSpy.callCount.should.equal(4);
            executeCommandSpy.getCall(1).should.have.been.calledWith('blockchainExplorer.refreshEntry');
            executeCommandSpy.getCall(3).should.have.been.calledWith('blockchainExplorer.refreshEntry');

            connections = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(2);
            connections[0].should.deep.equal({
                name: 'myConnection',
                connectionProfilePath: 'connection.json',
                identities: [{
                    certificatePath: '/myCertPath',
                    privateKeyPath: '/myPrivateKeyPath'
                }]
            });
            connections[1].should.deep.equal({
                name: 'myConnection2',
                connectionProfilePath: 'connection2.json',
                identities: [{
                    certificatePath: '/myCertPath2',
                    privateKeyPath: '/myPrivateKeyPath2'
                }]
            });
        });

        it('should test a connection can be cancelled when naming connection', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves();

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            // execute a command to force the extension activation
            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            const connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(0);

            executeCommandSpy.callCount.should.equal(1);
            executeCommandSpy.getCall(0).should.have.been.calledWith('blockchainExplorer.addConnectionEntry');
        });

        it('should test a connection can be cancelled when adding profile', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves('myConnection');
            showInputBoxStub.onSecondCall().resolves();

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            // execute a command to force the extension activation
            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            const connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(0);

            executeCommandSpy.callCount.should.equal(1);
            executeCommandSpy.getCall(0).should.have.been.calledWith('blockchainExplorer.addConnectionEntry');
        });

        it('should test a connection can be cancelled when adding certificate', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves('myConnection');
            showInputBoxStub.onSecondCall().resolves('connection.json');
            showInputBoxStub.onThirdCall().resolves();

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            // execute a command to force the extension activation
            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            const connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(0);

            executeCommandSpy.callCount.should.equal(1);
            executeCommandSpy.getCall(0).should.have.been.calledWith('blockchainExplorer.addConnectionEntry');
        });

        it('should test a connection can be cancelled when adding private key', async () => {
            await vscode.extensions.getExtension('IBM.blockchain-network-explorer').activate();

            // reset the available connections
            await vscode.workspace.getConfiguration().update('fabric.connections', [], vscode.ConfigurationTarget.Global);

            const showInputBoxStub = mySandBox.stub(vscode.window, 'showInputBox');

            showInputBoxStub.onFirstCall().resolves('myConnection');
            showInputBoxStub.onSecondCall().resolves('connection.json');
            showInputBoxStub.onThirdCall().resolves('/myCertPath');
            showInputBoxStub.onCall(3).resolves();

            const executeCommandSpy = mySandBox.spy(vscode.commands, 'executeCommand');

            await vscode.commands.executeCommand('blockchainExplorer.addConnectionEntry');

            const connections: Array<any> = vscode.workspace.getConfiguration().get('fabric.connections');

            connections.length.should.equal(0);

            executeCommandSpy.callCount.should.equal(1);
            executeCommandSpy.getCall(0).should.have.been.calledWith('blockchainExplorer.addConnectionEntry');
        });
    });
});
