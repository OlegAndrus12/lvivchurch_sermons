from django.db import models
from sermons_index.services.storage import AppBoxStorage

fs = AppBoxStorage()

class Bible(models.TextChoices):
    GENESIS = "Genesis", "Буття"
    EXODUS = "Exodus", "Вихід"
    LEVITICUS = "Leviticus", "Левіт"
    NUMBERS = "Numbers", "Числа"
    DEUTERONOMY = "Deuteronomy","Повторення Закону"
    JOSHUA = "Joshua","Ісус Навин"
    JUDGES = "Judges","Судді"
    RUTH = "Ruth","Рут"
    SAMUEL_1 = "1 Samuel","1 Самуїлова"
    SAMUEL_2 = "2 Samuel","2 Самуїлова"
    KINGS_1 = "1 Kings","1 Царів"
    KINGS_2 = "2 Kings","2 Царів"
    CHRONICLES_1 = "1 Chronicles","1 Хронік"
    CHRONICLES_2 = "2 Chronicles","2 Хронік"
    EZRA = "Ezra","Езра"
    NEHEMIAH = "Nehemiah","Неємія"
    ESTHER = "Esther","Естер"
    JOB = "Job","Йов"
    PSALMS = "Psalms","Псалми"
    PROVERBS = "Proverbs","Приповісті"
    ECCLESIASTES = "Ecclesiastes","Еклезіяст"
    SONG_OF_SOLOMON = "Song of Solomon","Пісня над піснями"
    ISAIAH = "Isaiah","Ісая"
    JEREMIAH = "Jeremiah","Єремія"
    LAMENTATIONS = "Lamentations","Плач Єремії"
    EZEKIEL = "Ezekiel","Єзекіїль"
    DANIEL = "Daniel","Даниїл"
    HOSEA = "Hosea","Осія"
    JOEL = "Joel","Йоіл"
    AMOS = "Amos","Амос"
    OBADIAH = "Obadiah","Овдій"
    JONAH = "Jonah","Йона"
    MICAH = "Micah","Михей"
    NAHUM = "Nahum","Наум"
    HABAKKUK = "Habakkuk","Авакум"
    ZEPHANIAH = "Zephaniah","Софонія"
    HAGGAI = "Haggai","Огій"
    ZECHARIAH = "Zechariah","Захарія"
    MALACHI = "Malachi","Малахія"
    MATTHEW = "Matthew","Матвій"
    MARK = "Mark","Марко"
    LUKE = "Luke","Лука"
    JOHN = "John","Іван"
    ACTS = "Acts","Дії"
    ROMANS = "Romans","Римлян"
    FIRST_CORINTHIANS = "1 Corinthians","1 Коринтян"
    SECOND_CORINTHIANS = "2 Corinthians","2 Коринтян"
    GALATIANS = "Galatians","Галатів"
    EPHESIANS = "Ephesians","Ефесян"
    PHILIPPIANS = "Philippians","Филип'ян"
    COLOSSIANS = "Colossians","Колосян"
    THESSALONIANS_1 = "1 Thessalonians","1 Солунян"
    THESSALONIANS_2 = "2 Thessalonians","2 Солунян"
    TIMOTHY_1 = "1 Timothy","1 Тимофія"
    TIMOTHY_2 = "2 Timothy","2 Тимофія"
    TITUS = "Titus","Тита"
    PHILEMON = "Philemon","Филимона"
    HEBREWS = "Hebrews","Євреїв"
    JAMES = "James","Якова"
    PETER_1 = "1 Peter","1 Петра"
    PETER_2 = "2 Peter","2 Петра"
    JOHN_1 = "1 John","1 Івана"
    JOHN_2 = "2 John","2 Івана"
    JOHN_3 = "3 John","3 Івана"
    JUDE = "Jude","Юда"
    REVELATION = "Revelation","Об’явлення"



class Preacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    class Meta:
        verbose_name = "Проповідник"
        verbose_name_plural = "Проповідники"

class Sermon(models.Model):
    preacher = models.ForeignKey(Preacher, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=100)
    date = models.DateField(unique=True)
    book = models.CharField(choices=Bible.choices, default=Bible.GENESIS.value, max_length=64)
    quote = models.CharField(blank=True, null=True, max_length=100)

    video = models.URLField(blank=True, null=True)
    audio = models.URLField(blank=True, null=True)
    text = models.URLField(blank=True, null=True)
    agenda = models.FileField(blank=True, null=True, storage=fs)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['date']
        verbose_name = "Проповідь"
        verbose_name_plural = "Проповіді"
