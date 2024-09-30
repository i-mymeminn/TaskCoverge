"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto"); // 해시 함수를 위한 모듈
// Edge 클래스: 한 노드에서 다른 노드로 연결되는 간선을 정의
var Edge = /** @class */ (function () {
    function Edge(action, dom, targetNode) {
        this.action = action;
        this.dom = dom;
        this.targetNode = targetNode;
    }
    return Edge;
}());
// Node 클래스: 그래프의 각 노드를 나타냄
var Node = /** @class */ (function () {
    function Node(url, domSnapshots) {
        this.url = url;
        this.domSnapshots = domSnapshots;
        this.id = this.generateID(); // URL + domSnapshot을 통해 ID 생성
        this.actionSets = [];
    }
    // 간선 추가
    Node.prototype.addEdge = function (action, dom, targetNode) {
        // 같은 액션, 같은 DOM, 같은 타겟 노드로의 간선이 이미 있는지 확인
        var exists = this.actionSets.some(function (edge) { return edge.action === action && edge.dom === dom && edge.targetNode.id === targetNode.id; });
        // 동일한 간선이 없는 경우에만 추가
        if (!exists) {
            var edge = new Edge(action, dom, targetNode);
            this.actionSets.push(edge);
        }
    };
    // URL과 DOM Snapshot 배열을 이용해 해시값(ID)을 생성
    Node.prototype.generateID = function () {
        var data = this.url + JSON.stringify(this.domSnapshots);
        return this.hashFunction(data);
    };
    // SHA-256 해시 함수를 통해 고유한 해시값 생성
    Node.prototype.hashFunction = function (data) {
        var hash = crypto.createHash('sha256').update(data).digest('hex');
        return hash;
    };
    return Node;
}());
// Task 클래스: 여러 개의 노드들로 구성된 작업(Task)
var Task = /** @class */ (function () {
    function Task() {
        this.nodes = new Map();
    }
    // 노드 추가
    Task.prototype.addNode = function (node) {
        if (!this.nodes.has(node.id)) {
            this.nodes.set(node.id, node);
        }
    };
    // 노드 간의 연결(간선)을 추가
    Task.prototype.connectNodes = function (sourceNode, action, dom, targetNode) {
        // 소스 노드가 이미 있는지 확인하고 있으면 가져옴
        var existingSourceNode = this.nodes.get(sourceNode.id) || sourceNode;
        // 타겟 노드가 이미 있는지 확인하고 있으면 가져옴
        var existingTargetNode = this.nodes.get(targetNode.id) || targetNode;
        // 소스 노드에 타겟 노드로의 간선을 추가
        existingSourceNode.addEdge(action, dom, existingTargetNode);
        // 소스 및 타겟 노드를 그래프에 추가
        this.addNode(existingSourceNode);
        this.addNode(existingTargetNode);
    };
    // 특정 ID로 노드를 찾기
    Task.prototype.findNodeById = function (id) {
        return this.nodes.get(id);
    };
    // 전체 그래프를 출력 (디버깅용)
    Task.prototype.printGraph = function () {
        this.nodes.forEach(function (node, id) {
            console.log("Node ID: ".concat(id, ", URL: ").concat(node.url));
            node.actionSets.forEach(function (edge) {
                console.log("  Action: ".concat(edge.action, ", DOM: ").concat(edge.dom, " -> Target Node: ").concat(edge.targetNode.url));
            });
        });
    };
    return Task;
}());
// 예시 실행 코드
// 노드 생성 (URL과 DOM Snapshot)
var node1 = new Node('https://www.example.com', [
    '<div><button id="btn">Click me</button></div>',
]);
var node2 = new Node('https://www.example.com/page2', [
    '<div><input type="text" id="input-box" /></div>',
]);
var node3 = new Node('https://www.example.com/page3', [
    '<div><a href="/page4">Go to Page 4</a></div>',
]);
var node4 = new Node('https://www.example.com/page4', [
    '<div><img src="image.jpg" alt="Example Image" /></div>',
]);
var node5 = new Node('https://www.example.com/page5', [
    '<div><ul><li>Item 1</li><li>Item 2</li></ul></div>',
]);
var node6 = new Node('https://www.example.com/page6', [
    '<div><button id="submit">Submit</button></div>',
]);
// 그래프 생성
var graph = new Task();
// 노드1에서 클릭 액션 발생 -> 노드2로 연결
graph.connectNodes(node1, 'click', '#btn', node2);
// 노드2에서 입력 액션 발생 -> 노드3로 연결
graph.connectNodes(node2, 'input', '#input-box', node3);
// 노드3에서 링크 클릭 -> 노드4로 연결
graph.connectNodes(node3, 'click', 'a[href="/page4"]', node4);
// 노드4에서 이미지를 클릭 -> 노드5로 연결
graph.connectNodes(node4, 'click', 'img[alt="Example Image"]', node5);
// 노드5에서 리스트 아이템을 클릭 -> 노드6으로 연결
graph.connectNodes(node5, 'click', 'li:nth-child(1)', node6);
// 노드6에서 'Submit' 버튼 클릭 -> 노드1로 돌아감
graph.connectNodes(node6, 'click', '#submit', node1);
// 추가 연결 및 액션
// 노드3에서 노드2로 다시 연결
graph.connectNodes(node3, 'click', 'a[href="/page4"]', node2);
// 노드1에서 다시 노드4로 연결
graph.connectNodes(node1, 'click', '#btn', node4);
// 노드4에서 노드2로 연결
graph.connectNodes(node4, 'click', 'img[alt="Example Image"]', node2);
// 중복된 액션 및 노드 연결 시도 (변경 없음)
graph.connectNodes(node1, 'click', '#btn', node2);
// 그래프 출력
graph.printGraph();
