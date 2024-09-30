import * as crypto from 'crypto'; // 해시 함수를 위한 모듈
 
// Edge 클래스: 한 노드에서 다른 노드로 연결되는 간선을 정의
class Edge {
    action: string;  // 액션 종류 (클릭, 입력 등)
    dom: string;     // 액션이 발생한 DOM 요소
    targetNode: Node; // 연결된 다음 노드
  
    constructor(action: string, dom: string, targetNode: Node) {
      this.action = action;
      this.dom = dom;
      this.targetNode = targetNode;
    }
}
// Node 클래스: 그래프의 각 노드를 나타냄
class Node {
  id: string;                // URL + domSnapshot으로 생성된 해시값
  url: string;               // 웹페이지 URL
  domSnapshots: string[];    // DOM Snapshot 배열
  actionSets: Edge[];   // 액션 목록 (해당 노드에서 발생한 액션들)

  constructor(url: string, domSnapshots: string[]) {
    this.url = url;
    this.domSnapshots = domSnapshots;
    this.id = this.generateID(); // URL + domSnapshot을 통해 ID 생성
    this.actionSets = [];
  }

  // 간선 추가
  addEdge(action: string, dom: string, targetNode: Node) {
     // 같은 액션, 같은 DOM, 같은 타겟 노드로의 간선이 이미 있는지 확인
     const exists = this.actionSets.some(
      (edge) => edge.action === action && edge.dom === dom && edge.targetNode.id === targetNode.id
    );

    // 동일한 간선이 없는 경우에만 추가
    if (!exists) {
      const edge = new Edge(action, dom, targetNode);
      this.actionSets.push(edge);
    }
  }

  // URL과 DOM Snapshot 배열을 이용해 해시값(ID)을 생성
  generateID(): string {
    const data = this.url + JSON.stringify(this.domSnapshots);
    return this.hashFunction(data);
  }

  // SHA-256 해시 함수를 통해 고유한 해시값 생성
  hashFunction(data: string): string {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash;
  }

}

// Task 클래스: 여러 개의 노드들로 구성된 작업(Task)
class Task {
    nodes: Map<string, Node>; // 노드를 ID를 키로 사용해 저장하는 Map

    constructor() {
      this.nodes = new Map<string, Node>();
    }
  
    // 노드 추가
    addNode(node: Node) {
      if (!this.nodes.has(node.id)) {
        this.nodes.set(node.id, node);
      }
    }
  
    // 노드 간의 연결(간선)을 추가
    connectNodes(sourceNode: Node, action: string, dom: string, targetNode: Node) {
      // 소스 노드가 이미 있는지 확인하고 있으면 가져옴
      const existingSourceNode = this.nodes.get(sourceNode.id) || sourceNode;

      // 타겟 노드가 이미 있는지 확인하고 있으면 가져옴
      const existingTargetNode = this.nodes.get(targetNode.id) || targetNode;

      // 소스 노드에 타겟 노드로의 간선을 추가
      existingSourceNode.addEdge(action, dom, existingTargetNode);

      // 소스 및 타겟 노드를 그래프에 추가
      this.addNode(existingSourceNode);
      this.addNode(existingTargetNode);
    }
  
    // 특정 ID로 노드를 찾기
    findNodeById(id: string): Node | undefined {
      return this.nodes.get(id);
    }
  
    // 전체 그래프를 출력 (디버깅용)
    printGraph() {
      this.nodes.forEach((node, id) => {
        console.log(`Node ID: ${id}, URL: ${node.url}`);
        node.actionSets.forEach(edge => {
          console.log(`  Action: ${edge.action}, DOM: ${edge.dom} -> Target Node: ${edge.targetNode.url}`);
        });
      });
    }
}

// 예시 실행 코드
// 노드 생성 (URL과 DOM Snapshot)
const node1 = new Node('https://www.example.com', [
  '<div><button id="btn">Click me</button></div>',
]);

const node2 = new Node('https://www.example.com/page2', [
  '<div><input type="text" id="input-box" /></div>',
]);

const node3 = new Node('https://www.example.com/page3', [
  '<div><a href="/page4">Go to Page 4</a></div>',
]);

const node4 = new Node('https://www.example.com/page4', [
  '<div><img src="image.jpg" alt="Example Image" /></div>',
]);

const node5 = new Node('https://www.example.com/page5', [
  '<div><ul><li>Item 1</li><li>Item 2</li></ul></div>',
]);

const node6 = new Node('https://www.example.com/page6', [
  '<div><button id="submit">Submit</button></div>',
]);

// 그래프 생성
const graph = new Task();

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
