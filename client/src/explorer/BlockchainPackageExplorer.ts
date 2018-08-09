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
import { PackageTreeItem } from './model/PackageTreeItem';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
const readDir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

export class BlockchainPackageExplorerProvider implements vscode.TreeDataProvider<PackageTreeItem> {
    public tree: Array<PackageTreeItem> = [];
    private packageArray: Array<any>;
    private packageDir: string;
    private _onDidChangeTreeData: vscode.EventEmitter<any | undefined> = new vscode.EventEmitter<any | undefined>();
    // tslint:disable-next-line member-ordering
    readonly onDidChangeTreeData: vscode.Event<any | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: PackageTreeItem): vscode.TreeItem {
        console.log('BlockchainPackageExplorer: getTreeItem', element);
        return element;
    }

    async getChildren(): Promise<PackageTreeItem[]> {
        this.packageDir = this.getPackageDir();
        console.log('packageDir is:', this.packageDir);
        console.log('BlockchainPackageExplorer: getChildren');

        try {
            this.packageArray = await readDir(this.packageDir);
        } catch (error) {
            console.log('Error reading smart contract folder:', error.message);
            vscode.window.showErrorMessage('Issue reading smart contract package folder:' + this.packageDir);
            return;
        }
        this.tree = await this.createPackageTree(this.packageArray as Array<PackageTreeItem>);
        return this.tree;
    }

    async refresh(): Promise<void> {
        console.log('BlockchainPackageExplorer: refresh');
        this._onDidChangeTreeData.fire();
    }

    private async createPackageTree(packageArray: Array<PackageTreeItem>): Promise<Array<PackageTreeItem>> {
        console.log('createPackageTree', packageArray);
        const tree: Array<PackageTreeItem> = [];

        for (const packageFile of this.packageArray) {
            let packageTitle: string = packageFile;
            if (packageTitle.startsWith('.')) {
                continue;
            }
            const packageVersionFile: string = path.join(this.packageDir, packageFile, '/package.json');
            try {
                const packageVersionFileContents: Buffer = await readFile(packageVersionFile);

                const packageVersionObj: any = JSON.parse(packageVersionFileContents.toString('utf8'));
                const packageVersion: string = packageVersionObj.version;
                console.log('printing packageVersion', packageVersion);
                if (packageVersion !== undefined) {
                    packageTitle = packageFile + ' - v' + packageVersion;
                }

            } catch (error) {
                console.log('failed to get smart contract package version', error.message);
            } finally {
                tree.push(new PackageTreeItem(packageTitle));
            }
        }
        return tree;
    }

    private getPackageDir(): string {
        console.log('getPackageDir');
        return vscode.workspace.getConfiguration().get('fabric.package.directory');
    }

}
