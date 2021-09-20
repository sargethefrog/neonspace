const W = 640;//Ширина игрового поля
const H = 373;//Высота игрового поля
const SHIP_W = 94;//Ширина корабля
const SHIP_H = 97;//Высота корабля
const BONUS_W = 32;//Ширина бонуса
const BONUS_H = 32;//Высота бонуса
// const STAR_W = 
const STAR_MAX_H = 103;//Максимальная высота звезды
const STAR_MIN_H = 40;//Минимальная высота звезды
const TEXT_PADDING = 13;//Расстояние между словом NEON и словом SPACE в названии игры
const SCREEN_PADDING = 10;//Расстояние от края игрового поля
const N = 10;//Количество очков, даваемое за взятие бонуса
const KEY_LEFT = 37;//Код клавиши СТРЕЛКА ВЛЕВО
const KEY_UP = 38;//Код клавиши СТРЕЛКА_ВВЕРХ
const KEY_RIGHT = 39;//Код клавиши СТРЕЛКА_ВПРАВО
const KEY_DOWN = 40;//Код клавиши СТРЕЛКА_ВНИЗ
const gameScreen = document.getElementById('game_screen');//Элемент игрового поля
let score = 0;//Переменная в которой хранится текущий счёт игры, изначально 0
const scoreElt = document.getElementById('score');//Элемент, в котором отображается счёт(очки)
const glare = document.getElementById('glare');//Элемент в котором содержится анимация блика на тексте
function updateScore(){
	scoreElt.innerText = score;
}
const movingDir = {//Объект отвечающий за управление с клавиатуры
	speed : 10,//Скорость перемещение корабля
	[KEY_LEFT] : 0,
	[KEY_UP] : 0,
	[KEY_RIGHT] : 0,
	[KEY_DOWN] : 0

};
class Ship{//Класс определяющий космический корабль
	constructor({x,y,allowToMove = false}){
		this.allowToMove = allowToMove;//Флаг, разрешающий перемещение корабля с клавиатуры, по умолчанию false
		this.x = x;//Координата корабля по горизонтали
		this.y = y;//Координата корабля по вертикали
		this.div = document.createElement('div');//DOM-элемент космического корабля
		this.body = document.createElement('div');//DOM-элемент, соответствующий корпусу корабля
		this.flame = document.createElement('div');//DOM-элемент, соответствующий огоньку под кораблем
		this.flameFrame = 0;//Поле отвечающее за номер кадра анимации огонька
		this.div.id = 'spaceship';//Задать идентификатор для элемента корабля(для связи с таблицей стилей)
		this.body.id = 'spaceship_body';//Задать идентификатор для корпуса корабля(для стилей)
		this.flame.id = 'spaceship_flame';//Задать идентификатор для элемента огонька под кораблем(для стилей)
		this.flame.style.backgroundPosition = '0px 0px';//Установить начальную позицию спрайта (0;0) для огонька
		this.div.append(this.body);//Добавить элемент корпуса в элемент корабля
		this.div.append(this.flame);//Добавить огонек в элемент корабля
		this.div.style.left = x + 'px';//Задать координату по X для DOM-элемента корабля
		this.div.style.top = y + 'px';//Задать координату по Y для DOM-элемента корабля
		gameScreen.append(this.div);//Добавить корабль на игровое поле
	}
	update(time){//Метод отвечающий за обновление состояния корабля,в него передаётся текущая метка времени
		let tm = (performance.now() - time) * .6;//Приращение кадра огонька
		this.flameFrame = Math.round(this.flameFrame + tm);//Добавить к кадру приращение и округлить
		if(this.flameFrame >= 6){//Если номер кадра больше или равен 6
			this.flameFrame = 0;//Сбросить в ноль
		}
		this.flame.style.backgroundPosition = this.flameFrame * 20 + 'px 0px';//Установить позицию спрайта для DOM-элемента огонька
		if(this.allowToMove){//Если разрешено перемещать корабль клавиатурой - обрабатывать перемещение клавиатурой
			/*
			Новое значение координаты x вычисляется как предыдущие значение координаты x минус приращение(если нажата клавиша ВЛЕВО)
			плюс приращение(если нажата клавиша ВПРАВО) 
			*/
			let newX = this.x - (movingDir[37] * movingDir.speed) + (movingDir[39] * movingDir.speed);
			if(newX > W - SHIP_W){//Если корабль выходит по координате x за правую границу игрового поля
				newX = W - SHIP_W;//Установить координату x равной ширине игрового поля минус ширина корабля
			} else if(newX < 0){//Если корабль выходит по координате x за левую границу игрового поля
				newX = 0;//Установить координату x равной 0
			}
			/*
			Новое значение координаты y вычисляется как предыдущие значение координаты y минус приращение(если нажата клавиша ВВЕРХ)
			плюс приращение(если нажата клавиша ВНИЗ) 
			*/
			let newY = this.y - (movingDir[38] * movingDir.speed) + (movingDir[40] * movingDir.speed);
			if(newY > H){//Если корабль выходит по координате y за нижнюю границу игрового поля
				newY = H;//Установить координату y равной высоте игрового поля
			} else if(newY < 0){//Если корабль выходит по координате y за верхнюю границу игрового поля
				newY = 0;//Установить координату y равной 0
			}
			/* Установить новые значения координат */
			this.x = newX;
			this.y = newY;
			this.div.style.left = newX + 'px';
			this.div.style.top = newY + 'px';
		}
	}
}
class Bonus{//Класс, определяющий бонус
	constructor({x,y,lifetime = 1000,manager = null,angle = 0,speed = 5,direction = 1,rotationSpeed = 5}){
		this.x = x;//Координата бонуса по горизонтали
		this.y = y;//Координата бонуса по вертикали
		this.angle = angle;//Угол поворота бонуса
		this.speed = speed;//Скорость движения бонуса
		this.rotationSpeed = rotationSpeed;//Скорость поворота бонуса
		this.direction = direction;//Направление движения бонуса : 1 - вперёд, 0 - назад
		this.lifetime = lifetime;//время жизни бонуса
		this.time = 0;
		this.div = document.createElement('div');//DOM-элемент бонуса
		this.div.classList.add('bonus');//добавить класс для установки стилей(обычное состояние бонуса - синий цвет)
		this.div.style.left = x + 'px';//Установить координату DOM-элемента бонуса по горизонтали
		this.div.style.top = y + 'px';//Установить координату DOM-элемента бонуса по вертикали
		this.div.style.transform = `rotate(${angle}deg)`;//Установить угол поворота DOM-элемента
		if(manager){//Если в конструктор передан менеджер бонусов
			this.manager = manager;//Сохранить объект менеджера бонусов в свойстве manager
			manager.add(this);//и добавить бонус в менеджер бонусов
		}
		gameScreen.appendChild(this.div);//Добавить DOM-элемент бонуса в дерево документа(в элемент соответствующий игровому полю)
	}
	update(time){//Метод отвечающий за обновление бонуса, в него передаётся текущая метка времени
		this.time = performance.now() - time;
		let deltaX = this.speed * Math.sin(this.angle * Math.PI / 180);//Приращение по координате x в соответствии с углом поворота
		let deltaY = this.speed * Math.cos(this.angle * Math.PI / 180);//Приращение по координате y в соответствии с углом поворота
		this.rotationSpeed = Math.round(Math.random() * 3);//Случайное приращение вращения
		this.angle += this.rotationSpeed * (Math.round(Math.random() * 2) - 1);//Повернуть бонус со случайным приращением
		this.x += deltaX * this.direction;//Установить новое значение координаты x в зависимости от направления движения
		this.y += deltaY * this.direction;//Установить новое значение координаты y в зависимости от направления движения
		if(this.x < SCREEN_PADDING || this.x > W - SCREEN_PADDING || this.y < SCREEN_PADDING || this.y > H - SCREEN_PADDING){//Если бонус вышел за пределы (игрового поля минус отступ от края игрового поля)
			this.clear();//Удалить бонус
			return;
		}
		this.div.style.left = `${this.x}px`;//Задать координату x для DOM-элемента бонуса
		this.div.style.top = `${this.y}px`;//Задать координату y для DOM-элемента бонуса
		this.div.style.transform = `rotateZ(${this.angle}deg)`;//Задать угол поворота для DOM-элемента бонуса
		if(this.time >= this.lifetime && !this.scored){//Если закончилось время жизни бонуса и он не собран
			this.clear();//Удалить бонус
			return;
		}
		let shipLeft = ship.x;//Координата x левого верхнего угла корабля
		let shipRight = shipLeft + SHIP_W;//Координата x правого нижнего угла корабля
		let shipTop = ship.y;//Координата y левого верхнего угла корабля
		let shipBottom = ship.y + SHIP_H;//Координата y правого нижнего угла корабля
		let left = this.x;//Координата x левого верхнего угла бонуса
		let right = this.x + 32;//Координата x правого нижнего угла бонуса
		let top = this.y;//Координата y левого верхнего угла бонуса
		let bottom = this.y + 32;//Координата y правого нижнего угла бонуса
		/* Проверка на пересечение бонуса с кораблём */
		let intersection = true;
		if(shipTop > bottom || top > shipBottom){
			intersection = false;
		}
		if(shipRight < left || right < shipLeft){
			intersection = false;
		}
		/* Проверка на пересечение бонуса с кораблём - окончание кода */
		if(intersection && !this.scored){//Если бонус пересекается с кораблём и ещё не был собран
			score += N;//Добавить N очков к счёту
			this.scored = true;//Установить флаг бонус собран
			updateScore();//Обновить DOM-элемент счёта
			if(this.manager){//Если определён менеджер бонусов
				this.manager.delete(this);//Удалить бонус из менеджера
			}
			this.div.classList.remove('bonus');//Удалить обычный класс бонуса
			this.div.classList.add('bonus_white');//Добавить класс собранного бонуса(белый цвет)
			this.msg = document.createElement('div');//Создать элемент с сообщением о количестве полученных очков
			this.msg.className = 'msg_plus';//Добавить класс для стилей
			this.msg.innerText = `+${N}`;//Задать текст для элемента сообщения
			this.msg.style.left = `${this.x}px`;//Задать координату x для элемента сообщения рядом с собранным бонусом
			this.msg.style.top = `${this.y}px`;//Задать координату y для элемента сообщения рядом с собранным бонусом
			gameScreen.append(this.msg);//Добавить сообщение о полученных очках на игровое поле
			setTimeout(() => {//установить задержку на удаление DOM-элемента бонуса с игрового поля
				gameScreen.removeChild(this.div);
				setTimeout(() => {//Установить задержку на удаление DOM-элемента сообщения об очках с игрового поля
					gameScreen.removeChild(this.msg);
				},300);
			},300);
		}
	}
	clear(){//Метод отвечающий за удаление бонуса
		if(this.manager){//Если определён менеджер бонусов
			this.manager.delete(this);//Удалить бонус из менеджера
		}
		this.div.classList.remove('bonus');//Удалить обычный класс бонуса
		this.div.classList.add('bonus_red');//Добавить класс исчезающего бонуса(красный цвет)
		this.msg = document.createElement('div');//Создать элемент с сообщением о количестве потерянных очков
		this.msg.className = 'msg_minus';//Добавить класс для стилей
		this.msg.innerText = `-${N * 3}`;//Задать текст для элемента сообщения
		this.msg.style.left = `${this.x}px`;//Задать координату x для элемента сообщения рядом с потерянным бонусом
		this.msg.style.top = `${this.y}px`;//Задать координату y для элемента сообщения рядом с потерянным бонусом
		gameScreen.append(this.msg);//Добавить сообщение о полученных очках на игровое поле
		setTimeout(() => {//установить задержку на удаление DOM-элемента бонуса с игрового поля
			gameScreen.removeChild(this.div);
			score -= N * 3;//Вычесть N * 3 очков из счёта
			updateScore();
			setTimeout(() => {//Установить задержку на удаление DOM-элемента сообщения об очках с игрового поля
				gameScreen.removeChild(this.msg);
			},300);
		},300);
	}
}
class BonusManager extends Set{//Класс, определяющий менеджер бонусов, наследуется от встроенного класса Set
	constructor(n = 5,allowUpdate = false){//n - максимальное количество бонусов в менеджере,allowUpdate - разрешение обновления(по умолчанию false)
		super();
		this.maxSize = n;//Максиммальное количество бонусов в менеджере
		this.allowUpdate = allowUpdate;
		this.nextTimeStamp = null;//Метка времени, соответствующая следующему добавлению бонуса
	}
	update(time){//Метод отвечающий за обновление менеджера бонусов
		if(this.allowUpdate){//если обновление разрешено
			for(const bonus of this){//Пройти циклом по всем бонусам в менеджере
				bonus.update(time);//И обновить каждый бонус
			}
			if(time >= this.nextTimeStamp && this.size < this.maxSize){//Если пришло время добавлять новый бонус и есть место в менеджере
				let interval = Math.round(Math.random() * 2900) + 100;//Установить случайное приращение для времени добавления нового бонуса
				this.nextTimeStamp = time + interval;//Установить время добавления нового бонуса как текущую метку времени плюс случайное приращение
				let x = Math.round(Math.random() * (W - (SCREEN_PADDING + 60))) + SCREEN_PADDING + 60;//Случайное значение координаты x в пределах игрового поля
				let y = Math.round(Math.random() * (H - (SCREEN_PADDING + 60))) + SCREEN_PADDING + 60;//Случайное значение координаты y в пределах игрового поля
				let angle = Math.round(Math.random() * 360);//Случайный угол поворота
				let speed = Math.round(Math.random() * 4) + 1;//Случайная скорость
				let lifetime = Math.round(Math.random() * 4500) + 500;//Случайное время жизни
				let direction = Math.round(Math.random()) ? 1 : -1;//Случайное напрвление движения
				let rotationSpeed = Math.round(Math.random() * 9) + 1;//Случайная скорость вращения
				new Bonus({x,y,angle,speed,direction,lifetime,rotationSpeed,manager : this});//Добавить новый бонус в менеджер
			}
		}
	}
}
class Star{//Класс, определяющий звезду
	constructor({width,height,x,y,speed = 1,opacity = 1,manager = null}){
		height < STAR_MIN_H ? height = STAR_MIN_H : height = height;//Высота звезды должна быть не меньше минимальной
		height > STAR_MAX_H ? height = STAR_MAX_H : height = height;//Высота звезды должна быть не больше максимальной
		/*Инициализация свойств объекта звезды */
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.opacity = opacity;
		/*Инициализация свойств объекта звезды - окончание */
		this.div = document.createElement('div');//создать DOM-элемент звезды
		this.div.classList.add('star');//добавить класс для стилей
		/* Установить свойства DOM-элемента звезды, определяющие геометрию */
		this.div.style.left = x + 'px';
		this.div.style.top = y + 'px';
		this.div.style.width = width + 'px';
		this.div.style.height = height + 'px';
		/* Установить свойства DOM-элемента звезды, определяющие геометрию - окончание кода */
		this.div.style.opacity = opacity;//Установить значение прозрачности для DOM-элемента звезды
		if(manager){//если менеджер определён
			this.manager = manager;
			manager.add(this);//добавить звезду в менеджер
		}
		gameScreen.append(this.div);//Добавить DOM-элемент звезды на игровой экран
	}
	update(time){//Метод отвечающий за обновление звезды, в него передаётся метка времени
		this.y = this.y + this.speed * time;//Переместить звезду вниз с опрделённой скоростью
		if(this.y >= gameScreen.offsetHeight){//Если звезда вышла за пределы игрового поля
			this.clear();//Вызвать метод удаления звезды
			return;
		}
		this.div.style.top = this.y + 'px';//Задать координату y для DOM-элемента звезды
	}
	clear(){//Метод, отвечающий за удаление звезды
		if(this.manager){//Если менеджер определён - удалить звезду из менеджера
			this.manager.delete(this);
		}
		gameScreen.removeChild(this.div);//Удалить DOM-элемент звезды из дерева документа(с игрового поля)
	}
}
class StarManager extends Set{//Класс, определяющий менеджер звезд, наследуется от встроенного класса Set
	constructor(n = 10,allowUpdate = false){//n - количество звёзд в менеджере, allowUpdate - разрешение обновления(по умолчанию false)
		super();
		this.maxSize = n;
		this.allowUpdate = allowUpdate;
	}
	update(time){//Метод, отвечающий за обновление менеджера звёзд
		time = (performance.now() - time) * .6;//приращение времени 
		if(this.allowUpdate){//Если обновление разрешено
			for(let star of this){//Пройтись циклом по всем звёздам в менеджере
				star.update(time);//и обновить каждую звезду
			}
			if(this.size < this.maxSize){//Если в менеджере есть место - добавить в него новую звезду
				let x = Math.round(Math.random() * W);
				let y = Math.round(Math.random() * H);
				let height = Math.round(Math.random() * 63) + 40;
				let width = Math.round(Math.random() * 11) + 2;
				let speed = Math.round(Math.random() * 9) + 1;
				let opacity = Math.random();
				new Star({x,y,width,height,speed,opacity,manager : this});
			}
		}

	}
}
const ship = new Ship({//Космический корабль
	x : W /2 - SHIP_W / 2 - TEXT_PADDING,//По горизонтали устанавливается посередине экрана
	y : 280,
});
const starManager = new StarManager(30);//Менеджер звезд
const bonusManager = new BonusManager(5);//Менеджер бонусов
setTimeout(function(){//Установить задержку для появления названия игры
	const text = document.getElementById('text');//Получить доступ к контейнеру в котором находится название игры
	const neon = document.createElement('div');//Создать элемент 
	neon.id = 'neon';
	const space = document.createElement('div');
	space.id = 'space';
	text.append(neon);
	text.append(space);
},500);
let allowPlayingTextAnim = false;//Изначально запретить проигрывание анимации блика на тексте
setTimeout(function(){//Установить задержку для проигрывания анимации блика на тексте
	allowPlayingTextAnim = true;
},1500);
function update(time){//Основной цикл игры
	ship.update(time);//Обновление космического корабля
	starManager.update(time);//Обновление менеджера звёзд
	bonusManager.update(time);//Обновление менеджера бонусов
	window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);
window.addEventListener('keydown',function(e){
	/*
	Регистрация события нажатия на клавишу.
	Если клавиша нажата - свойство объекта, соответствующее коду нажатой клавиши устанавливается в 1
	*/
	movingDir[e.keyCode] = 1;
});
window.addEventListener('keyup',function(e){
	/*
	Регистрация события отпускания клавиши.
	Если клавиша отпущена - свойство объекта, соответствующее коду отпущенной клавиши устанавливается в 0
	*/
	movingDir[e.keyCode] = 0;
});
/*Анимация блика на тексте*/
let glareFrame = 0;//Номер кадра - установить в 0
let glareInterval = setInterval(function(){//Повторять каждые 30 миллисекунд
	if(allowPlayingTextAnim){//Если пришло время для проигрывания анимации блика на тексте
		if(glareFrame >= 30){//если номер кадра больше 29 - выключить анимацию
			clearInterval(glareInterval);//Очистить интервал
			textAnimToPlay = false;//Запретить проигрывание анимации текстового блика
			starManager.allowUpdate = true;//Разрешить звезды
			ship.allowToMove = true;//Разрешить перемещение корабля клавиатурой
			bonusManager.allowUpdate = true;//Разрещить бонусы
			return;//Выйти из функции
		}
		let x = Math.round((glareFrame % 5) * 340);//Координата по горизонтали в спрайте
		let y =  Math.round(Math.trunc(glareFrame / 5) * 39);//Координата по вертикали в спрайте
		glare.style.backgroundPosition = `-${x}px -${y}px`;//Установить позицию фона для элемента с бликом
		glareFrame++;//Инкрементировать номер кадра
	}
},30);
/*Анимация блика на тексте - окончание кода*/