import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { NavBarService } from '../service/nav-bar.service';
import { Menu, FlatMenu } from '../types/nav-bar.types';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {

  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);
  treeControl: FlatTreeControl<FlatMenu>;
  treeFlatener: MatTreeFlattener<Menu, FlatMenu>;
  dataSource: MatTreeFlatDataSource<Menu, FlatMenu>;

  constructor(private breakpointObserver: BreakpointObserver, private navBarService: NavBarService) {
    this.treeFlatener = new MatTreeFlattener(this.transformer, this._getLevel, this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FlatMenu>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlatener);
    navBarService.getMenu().subscribe(data => {
      this.dataSource.data = data;
    });
  }

  transformer = (node: Menu, level: number): FlatMenu => {
    const menuNode = new FlatMenu();
    menuNode.name = node.name;
    menuNode.path = node.path;
    menuNode.level = level;
    menuNode.expandable = !!node.children;
    return menuNode;
  }

  private _getLevel = (node: FlatMenu): number => {
    return node.level;
  }

  private _isExpandable = (node: FlatMenu): boolean => {
    return node.expandable;
  }

  private _getChildren = (node: Menu): Observable<Menu[]> => {
    return of(node.children);
  }

  hasChild = (_: number, _nodeData: FlatMenu): boolean => _nodeData.expandable;
}
