'''
Business: Получение данных из Google Sheets о тренировках участников
Args: event - dict with httpMethod, queryStringParameters (user_id, telegram_id, name, surname)
      context - object with attributes: request_id, function_name
Returns: JSON с данными участника и общей статистикой
'''

import json
import csv
from typing import Dict, Any, List, Optional
from urllib.request import urlopen
from urllib.parse import quote

SHEET_ID = "1O3UoAWfpbItX3qnj4dtiHkzVI-TlOJALKFlKaNQw5fY"
GID = "747824224"

def get_sheet_data() -> List[Dict[str, Any]]:
    """Получить данные из Google Sheets в формате CSV"""
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
    
    with urlopen(url) as response:
        content = response.read().decode('utf-8')
        
    lines = content.strip().split('\n')
    reader = csv.reader(lines)
    
    # Пропускаем заголовок
    next(reader)
    
    participants = []
    for idx, row in enumerate(reader, 1):
        if len(row) >= 3 and row[1] and row[2]:  # Проверяем что есть фамилия и имя
            surname = row[1].strip()
            name = row[2].strip()
            trainings_completed = int(row[3]) if len(row) > 3 and row[3].strip().isdigit() else 0
            trainings_left = int(row[4]) if len(row) > 4 and row[4].strip().isdigit() else 10
            
            participants.append({
                'id': f"{surname}_{name}_{idx}",  # Уникальный ID из фамилии, имени и индекса
                'surname': surname,
                'name': name,
                'trainings_completed': trainings_completed,
                'trainings_left': trainings_left,
                'full_name': f"{surname} {name}"
            })
    
    return participants

def calculate_stats(participants: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Рассчитать общую статистику"""
    total_completed = len([p for p in participants if p['trainings_completed'] >= 10])
    
    # Сортируем по количеству выполненных тренировок
    sorted_participants = sorted(participants, key=lambda x: x['trainings_completed'], reverse=True)
    
    return {
        'total_participants': len(participants),
        'total_completed_goal': total_completed,
        'leaderboard': sorted_participants
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        user_id = params.get('user_id', '')
        
        # Получаем данные из таблицы
        participants = get_sheet_data()
        stats = calculate_stats(participants)
        
        # Если передан user_id, ищем конкретного участника
        user_data = None
        user_rank = None
        
        if user_id:
            for idx, participant in enumerate(stats['leaderboard'], 1):
                if participant['id'] == user_id:
                    user_data = participant
                    user_rank = idx
                    break
        
        result = {
            'user': user_data,
            'rank': user_rank,
            'stats': {
                'total_participants': stats['total_participants'],
                'total_completed_goal': stats['total_completed_goal']
            },
            'leaderboard': stats['leaderboard']
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result, ensure_ascii=False)
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }