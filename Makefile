ship::
	npm run build
	rsync -vhra --exclude="node_modules" --exclude=".env" . elemental:elemental
	# ssh elemental -t 'cd elemental && docker compose up elemental -d --build'
	ssh elemental -t 'cd elemental && docker compose up -d --build'
