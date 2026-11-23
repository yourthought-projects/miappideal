-- Migración 0002: Semilla de necesidades iniciales

INSERT OR IGNORE INTO necesidades (id, necesidad, molestia, email, votos, estado, visible, created_at) VALUES
(
    'item-1',
    'Sería bueno un lugar donde organizar mis siembras, sin tener que crear cuentas o hacer cálculos matemáticos, simple casi como un juego de jardinería.',
    'Pierdo tiempo anotando fechas de cultivo en libretas mojadas o calendarios que se me olvidan en casa.',
    NULL,
    245,
    'En desarrollo',
    1,
    1732264800000
),
(
    'item-2',
    'Dividir la cuenta del almuerzo o los gastos compartidos al instante sin obligar a nadie a descargar apps ni registrarse.',
    'Hacer cálculos en la mesa o enviar capturas por WhatsApp y esperar semanas a que me transfieran.',
    NULL,
    312,
    'Lanzada',
    1,
    1732156800000
),
(
    'item-3',
    'Alertas sencillas de mantenimiento del auto y la casa (cambio de aceite, filtro de agua, balones de gas) que avisen con tiempo.',
    'Olvidarme de los mantenimientos hasta que algo se rompe o se vence la revisión.',
    NULL,
    180,
    'En evaluación',
    1,
    1732311600000
),
(
    'item-4',
    'Una lista de compras rápida ordenada automáticamente por zonas del mercado local para no dar vueltas innecesarias.',
    'Anotar listas desordenadas en papel y terminar olvidando la mitad de las cosas.',
    NULL,
    124,
    'En evaluación',
    1,
    1732070400000
),
(
    'item-5',
    'Un recordatorio de medicamentos con botones gigantes y sonidos claros pensado para mis padres adultos mayores.',
    'Se confunden con las alarmas normales del celular o no entienden qué pastilla les toca tomar.',
    NULL,
    267,
    'En desarrollo',
    1,
    1732318800000
),
(
    'item-6',
    'Organizar los pedidos de clientes que recibo por WhatsApp en un tablero visual muy simple sin pagar sistemas costosos.',
    'Perder mensajes entre tantas conversaciones de chat y olvidar enviar algunos pedidos a tiempo.',
    NULL,
    395,
    'Lanzada',
    1,
    1731984000000
);

