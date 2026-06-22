from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, shop_id: str):
        await websocket.accept()
        if shop_id not in self.active_connections:
            self.active_connections[shop_id] = []
        self.active_connections[shop_id].append(websocket)

    def disconnect(self, websocket: WebSocket, shop_id: str):
        if shop_id in self.active_connections:
            self.active_connections[shop_id].remove(websocket)

    async def broadcast(self, shop_id: str, message: dict):
        if shop_id in self.active_connections:
            for connection in self.active_connections[shop_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()