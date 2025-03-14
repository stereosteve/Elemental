ship::
	npm run build
	rsync -zhra --exclude="node_modules" --exclude=".env" . elemental:elemental
	ssh elemental -t 'cd elemental && docker compose up -d --build'
