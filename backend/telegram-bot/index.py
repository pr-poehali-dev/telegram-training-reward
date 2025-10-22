'''
Business: Telegram бот для опроса пользователей и отправки персональной статистики тренировок
Args: event - webhook от Telegram, context - метаданные функции
Returns: HTTP ответ со статусом 200
'''

import json
import os
import requests
from typing import Dict, Any, Optional
from dataclasses import dataclass

TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TRAINING_API_URL = 'https://functions.poehali.dev/b2c76a34-3c91-46fc-b13f-bd1d518ee850'

@dataclass
class UserState:
    chat_id: int
    waiting_for_name: bool = False
    waiting_for_surname: bool = False
    name: str = ''
    surname: str = ''

user_states: Dict[int, UserState] = {}

def send_message(chat_id: int, text: str, reply_markup: Optional[Dict] = None) -> None:
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    if reply_markup:
        payload['reply_markup'] = reply_markup
    
    requests.post(url, json=payload)

def get_user_stats(name: str, surname: str) -> Optional[Dict[str, Any]]:
    response = requests.get(TRAINING_API_URL)
    if response.status_code != 200:
        return None
    
    data = response.json()
    leaderboard = data.get('leaderboard', [])
    
    for participant in leaderboard:
        if (participant.get('name', '').lower() == name.lower() and 
            participant.get('surname', '').lower() == surname.lower()):
            return participant
    
    return None

def handle_start(chat_id: int) -> None:
    user_states[chat_id] = UserState(chat_id=chat_id, waiting_for_surname=True)
    send_message(
        chat_id,
        '👋 Добро пожаловать!\n\n'
        'Я помогу узнать ваш прогресс в челлендже "10 тренировок".\n\n'
        'Для начала напишите вашу <b>фамилию</b>:'
    )

def handle_surname(chat_id: int, surname: str) -> None:
    if chat_id not in user_states:
        user_states[chat_id] = UserState(chat_id=chat_id)
    
    user_states[chat_id].surname = surname
    user_states[chat_id].waiting_for_surname = False
    user_states[chat_id].waiting_for_name = True
    
    send_message(
        chat_id,
        f'Отлично! Фамилия: <b>{surname}</b>\n\n'
        'Теперь напишите ваше <b>имя</b>:'
    )

def handle_name(chat_id: int, name: str) -> None:
    if chat_id not in user_states:
        send_message(chat_id, 'Ошибка. Начните заново с /start')
        return
    
    state = user_states[chat_id]
    state.name = name
    state.waiting_for_name = False
    
    stats = get_user_stats(name, state.surname)
    
    if stats:
        completed = stats.get('trainings_completed', 0)
        left = stats.get('trainings_left', 10)
        
        message = (
            f'🎯 <b>{state.surname} {name}</b>\n\n'
            f'📊 Сейчас у вас: <b>{completed} из 10</b> тренировок\n'
            f'🎁 До подарка осталось: <b>{left} тренировок</b>\n\n'
        )
        
        if completed >= 10:
            message += '🎉 Поздравляем! Вы выполнили челлендж!\n'
            message += '🎁 Вы получаете скидку 15% на следующий блок!'
        elif left <= 3:
            message += f'💪 Осталось совсем чуть-чуть! Вы почти у цели!'
        else:
            message += f'✨ Продолжайте в том же духе!'
        
        send_message(chat_id, message)
    else:
        send_message(
            chat_id,
            f'❌ К сожалению, пользователь <b>{state.surname} {name}</b> не найден в таблице участников.\n\n'
            'Проверьте правильность написания имени и фамилии и попробуйте снова с /start'
        )
    
    del user_states[chat_id]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        message = body.get('message', {})
        chat_id = message.get('chat', {}).get('id')
        text = message.get('text', '').strip()
        
        if not chat_id:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'isBase64Encoded': False,
                'body': json.dumps({'status': 'ok'})
            }
        
        if text == '/start':
            handle_start(chat_id)
        elif chat_id in user_states:
            state = user_states[chat_id]
            if state.waiting_for_surname:
                handle_surname(chat_id, text)
            elif state.waiting_for_name:
                handle_name(chat_id, text)
        else:
            send_message(
                chat_id,
                'Для начала работы отправьте команду /start'
            )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'status': 'ok'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
